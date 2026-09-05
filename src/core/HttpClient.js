import {
  WhapiError,
  WhapiApiError,
  WhapiRateLimitError,
  WhapiTimeoutError,
  WhapiNetworkError,
  WhapiValidationError,
} from './errors.js';
import { shouldRetry, calculateBackoff, parseRetryAfter, sleep } from './retry.js';
import { createLogger, redactSecrets } from './logger.js';
import { assertNonEmptyString } from './validation.js';

const DEFAULT_BASE_URL = 'https://gate.whapi.cloud';
const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * Core HTTP Client for communicating with the Whapi.Cloud API.
 */
export class HttpClient {
  /**
   * @param {object} options
   * @param {string} options.token - Whapi.Cloud API token (required)
   * @param {string} [options.baseUrl='https://gate.whapi.cloud'] - Base API URL
   * @param {number} [options.timeout=30000] - Request timeout in milliseconds
   * @param {object} [options.retry] - Retry configuration
   * @param {boolean} [options.retry.enabled=true]
   * @param {number} [options.retry.attempts=3]
   * @param {number} [options.retry.minDelay=500]
   * @param {number} [options.retry.maxDelay=5000]
   * @param {boolean} [options.retry.retryUnsafeRequests=false]
   * @param {object} [options.logger] - Optional logger instance
   */
  constructor(options = {}) {
    this.token = assertNonEmptyString(options.token, 'token');

    let base = (options.baseUrl || DEFAULT_BASE_URL).trim();
    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }
    this.baseUrl = base;

    this.timeout =
      typeof options.timeout === 'number' && options.timeout > 0
        ? options.timeout
        : DEFAULT_TIMEOUT_MS;

    const retryOpt = options.retry || {};
    this.retryConfig = {
      enabled: retryOpt.enabled !== false,
      attempts: typeof retryOpt.attempts === 'number' ? Math.max(1, retryOpt.attempts) : 3,
      minDelay: typeof retryOpt.minDelay === 'number' ? retryOpt.minDelay : 500,
      maxDelay: typeof retryOpt.maxDelay === 'number' ? retryOpt.maxDelay : 5000,
      retryUnsafeRequests: Boolean(retryOpt.retryUnsafeRequests),
    };

    this.logger = createLogger(options.logger, this.token);
  }

  /**
   * Constructs a full URL with query parameters.
   *
   * @param {string} path
   * @param {Record<string, unknown>} [query]
   * @returns {string}
   */
  buildUrl(path, query) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (query && typeof query === 'object') {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            for (const item of value) {
              url.searchParams.append(key, String(item));
            }
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      }
    }

    return url.toString();
  }

  /**
   * Prepares headers and serializes body for fetch.
   *
   * @param {unknown} body
   * @param {Record<string, string>} [customHeaders]
   * @returns {{ headers: Record<string, string>, body: BodyInit|undefined }}
   */
  prepareBody(body, customHeaders = {}) {
    const headers = {
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${this.token}`,
      ...customHeaders,
    };

    if (body === undefined || body === null) {
      return { headers, body: undefined };
    }

    // Check FormData
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      // Fetch will automatically compute the multipart boundary
      delete headers['Content-Type'];
      return { headers, body };
    }

    // Check Blob / Buffer / Uint8Array
    if (
      (typeof Blob !== 'undefined' && body instanceof Blob) ||
      body instanceof Uint8Array ||
      (typeof Buffer !== 'undefined' && Buffer.isBuffer(body))
    ) {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/octet-stream';
      }
      return { headers, body };
    }

    // String body
    if (typeof body === 'string') {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'text/plain; charset=utf-8';
      }
      return { headers, body };
    }

    // Default: JSON object
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    return { headers, body: JSON.stringify(body) };
  }

  /**
   * Executes an HTTP request with timeout, signal, and retry handling.
   *
   * @param {object} params
   * @param {string} [params.method='GET']
   * @param {string} params.path - Endpoint path (e.g. '/messages/text')
   * @param {Record<string, unknown>} [params.query]
   * @param {unknown} [params.body]
   * @param {Record<string, string>} [params.headers]
   * @param {AbortSignal} [params.signal] - Caller abort signal
   * @returns {Promise<any>}
   */
  async request({
    method = 'GET',
    path,
    query,
    body,
    headers: customHeaders = {},
    signal: callerSignal,
  }) {
    if (!path || typeof path !== 'string') {
      throw new WhapiValidationError('HTTP request path must be a non-empty string', {
        field: 'path',
        value: path,
      });
    }

    const upperMethod = method.toUpperCase();
    const url = this.buildUrl(path, query);
    const maxAttempts = this.retryConfig.enabled ? this.retryConfig.attempts : 1;

    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      attempt += 1;
      const startTime = Date.now();

      // Check caller signal before starting
      if (callerSignal?.aborted) {
        throw callerSignal.reason || new Error('Request aborted by caller');
      }

      // Create internal timeout controller
      const timeoutController = new AbortController();
      let isTimedOut = false;
      const timer = setTimeout(() => {
        isTimedOut = true;
        timeoutController.abort();
      }, this.timeout);

      // Handle caller signal if provided
      let onCallerAbort;
      if (callerSignal) {
        onCallerAbort = () => {
          timeoutController.abort(callerSignal.reason);
        };
        callerSignal.addEventListener('abort', onCallerAbort, { once: true });
      }

      try {
        const { headers, body: reqBody } = this.prepareBody(body, customHeaders);

        this.logger.debug(`[Whapi SDK] ${upperMethod} ${path} (attempt ${attempt}/${maxAttempts})`);

        const response = await fetch(url, {
          method: upperMethod,
          headers,
          body: reqBody,
          signal: timeoutController.signal,
        });

        clearTimeout(timer);
        if (callerSignal && onCallerAbort) {
          callerSignal.removeEventListener('abort', onCallerAbort);
        }

        const durationMs = Date.now() - startTime;
        this.logger.debug(
          `[Whapi SDK] ${upperMethod} ${path} -> ${response.status} (${durationMs}ms)`,
        );

        if (response.ok) {
          if (response.status === 204) {
            return {};
          }

          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return await response.json();
          }

          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (_e) {
            return text;
          }
        }

        // Response is 4xx or 5xx
        const rawErrorData = await this.parseErrorResponse(response);
        const requestId =
          response.headers.get('x-request-id') || response.headers.get('request-id') || undefined;
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterMs = parseRetryAfter(retryAfterHeader);

        let error;
        if (response.status === 429) {
          error = new WhapiRateLimitError(
            rawErrorData.message || `Whapi rate limit exceeded (HTTP 429)`,
            {
              status: 429,
              code: rawErrorData.code || 'RATE_LIMIT_EXCEEDED',
              details: rawErrorData.details,
              href: rawErrorData.href,
              support: rawErrorData.support,
              method: upperMethod,
              endpoint: path,
              requestId,
              retryAfter: retryAfterMs ?? undefined,
              response: rawErrorData.raw,
            },
          );
        } else {
          error = new WhapiApiError(
            rawErrorData.message || `Whapi API error (HTTP ${response.status})`,
            {
              status: response.status,
              code: rawErrorData.code,
              details: rawErrorData.details,
              href: rawErrorData.href,
              support: rawErrorData.support,
              method: upperMethod,
              endpoint: path,
              requestId,
              retryable: response.status >= 500,
              response: rawErrorData.raw,
            },
          );
        }

        lastError = error;

        // Check if retry should be attempted
        const canRetry = shouldRetry({
          method: upperMethod,
          error,
          attempt,
          maxAttempts,
          retryUnsafeRequests: this.retryConfig.retryUnsafeRequests,
        });

        if (canRetry && attempt < maxAttempts) {
          const delay = calculateBackoff({
            attempt,
            minDelay: this.retryConfig.minDelay,
            maxDelay: this.retryConfig.maxDelay,
            retryAfter: retryAfterMs,
          });

          this.logger.warn(
            `[Whapi SDK] Retrying ${upperMethod} ${path} in ${delay}ms after HTTP ${response.status}`,
          );
          await sleep(delay, callerSignal);
          continue;
        }

        throw error;
      } catch (err) {
        clearTimeout(timer);
        if (callerSignal && onCallerAbort) {
          callerSignal.removeEventListener('abort', onCallerAbort);
        }

        // Handle caller abort vs timeout
        if (callerSignal?.aborted) {
          throw callerSignal.reason || err;
        }

        let classifiedError = err;
        if (isTimedOut) {
          classifiedError = new WhapiTimeoutError(
            `Request timed out after ${this.timeout}ms for ${upperMethod} ${path}`,
            {
              timeoutMs: this.timeout,
              method: upperMethod,
              endpoint: path,
              cause: err,
            },
          );
        } else if (!(err instanceof WhapiApiError)) {
          classifiedError = new WhapiNetworkError(
            `Network error during ${upperMethod} ${path}: ${err.message}`,
            {
              method: upperMethod,
              endpoint: path,
              cause: err,
            },
          );
        }

        lastError = classifiedError;

        const canRetry = shouldRetry({
          method: upperMethod,
          error: classifiedError,
          attempt,
          maxAttempts,
          retryUnsafeRequests: this.retryConfig.retryUnsafeRequests,
        });

        if (canRetry && attempt < maxAttempts) {
          const delay = calculateBackoff({
            attempt,
            minDelay: this.retryConfig.minDelay,
            maxDelay: this.retryConfig.maxDelay,
          });

          this.logger.warn(
            `[Whapi SDK] Retrying ${upperMethod} ${path} in ${delay}ms after error: ${classifiedError.message}`,
          );
          await sleep(delay, callerSignal);
          continue;
        }

        throw classifiedError;
      }
    }

    throw lastError || new WhapiError(`Request failed after ${maxAttempts} attempt(s)`);
  }

  /**
   * Extracts error payload from a non-ok Response.
   *
   * @param {Response} response
   * @returns {Promise<{ message: string, code?: string|number, details?: string, href?: string, support?: string, raw: any }>}
   */
  async parseErrorResponse(response) {
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const sanitized = redactSecrets(json, this.token);
        if (sanitized && typeof sanitized === 'object') {
          // Whapi structure: { error: { code, message, details, href, support } }
          if (sanitized.error && typeof sanitized.error === 'object') {
            return {
              message: sanitized.error.message || `API error ${response.status}`,
              code: sanitized.error.code,
              details: sanitized.error.details,
              href: sanitized.error.href,
              support: sanitized.error.support,
              raw: sanitized,
            };
          }
          if (sanitized.message) {
            return {
              message: sanitized.message,
              code: sanitized.code,
              details: sanitized.details,
              raw: sanitized,
            };
          }
          return {
            message: `API error ${response.status}`,
            raw: sanitized,
          };
        }
      }

      const text = await response.text();
      return {
        message: text.slice(0, 300) || `HTTP error ${response.status}`,
        raw: text,
      };
    } catch (_e) {
      return {
        message: `HTTP error ${response.status}`,
        raw: null,
      };
    }
  }
}
