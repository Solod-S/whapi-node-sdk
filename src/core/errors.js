/**
 * Base error class for all Whapi SDK errors.
 */
export class WhapiError extends Error {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.code]
   * @param {unknown} [options.cause]
   */
  constructor(message, options = {}) {
    super(message);
    this.name = 'WhapiError';
    this.code = options.code || 'WHAPI_ERROR';
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Error returned by the Whapi.Cloud REST API (HTTP 4xx/5xx).
 */
export class WhapiApiError extends WhapiError {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {number} [options.status] - HTTP status code
   * @param {number|string} [options.code] - Whapi error code
   * @param {string} [options.details] - Additional error details
   * @param {string} [options.href] - Documentation link
   * @param {string} [options.support] - Support contact
   * @param {string} [options.method] - HTTP method
   * @param {string} [options.endpoint] - API path/URL
   * @param {string} [options.requestId] - Request ID if present
   * @param {boolean} [options.retryable] - Whether the error is potentially retryable
   * @param {unknown} [options.response] - Raw response body
   * @param {unknown} [options.cause]
   */
  constructor(message, options = {}) {
    super(message, options);
    this.name = 'WhapiApiError';
    this.status = options.status || 500;
    this.code = options.code ?? `HTTP_${this.status}`;
    this.details = options.details;
    this.href = options.href;
    this.support = options.support;
    this.method = options.method;
    this.endpoint = options.endpoint;
    this.requestId = options.requestId;
    this.retryable = Boolean(options.retryable);
    this.response = options.response;
  }

  /**
   * Returns a sanitized JSON representation without credentials.
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      href: this.href,
      support: this.support,
      method: this.method,
      endpoint: this.endpoint,
      requestId: this.requestId,
      retryable: this.retryable,
      response: this.response,
    };
  }
}

/**
 * Thrown when client-side validation fails before making an API request.
 */
export class WhapiValidationError extends WhapiError {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.field] - The field or parameter that failed validation
   * @param {unknown} [options.value] - The invalid value (sanitized)
   * @param {unknown} [options.cause]
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'VALIDATION_ERROR' });
    this.name = 'WhapiValidationError';
    this.field = options.field;
    this.value = options.value;
  }
}

/**
 * Thrown when an API request exceeds the configured timeout.
 */
export class WhapiTimeoutError extends WhapiError {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {number} [options.timeoutMs] - The timeout in milliseconds
   * @param {string} [options.method]
   * @param {string} [options.endpoint]
   * @param {unknown} [options.cause]
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'REQUEST_TIMEOUT' });
    this.name = 'WhapiTimeoutError';
    this.timeoutMs = options.timeoutMs;
    this.method = options.method;
    this.endpoint = options.endpoint;
    this.retryable = true;
  }
}

/**
 * Thrown on lower-level network failures (e.g. DNS resolution failure, socket connection drop).
 */
export class WhapiNetworkError extends WhapiError {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {string} [options.method]
   * @param {string} [options.endpoint]
   * @param {unknown} [options.cause]
   */
  constructor(message, options = {}) {
    super(message, { ...options, code: options.code || 'NETWORK_ERROR' });
    this.name = 'WhapiNetworkError';
    this.method = options.method;
    this.endpoint = options.endpoint;
    this.retryable = true;
  }
}

/**
 * Thrown when the client receives an HTTP 429 Too Many Requests response.
 */
export class WhapiRateLimitError extends WhapiApiError {
  /**
   * @param {string} message
   * @param {object} [options]
   * @param {number} [options.retryAfter] - Retry delay in milliseconds if provided by Retry-After header
   */
  constructor(message, options = {}) {
    super(message, { ...options, status: 429, retryable: true });
    this.name = 'WhapiRateLimitError';
    this.code = options.code ?? 'RATE_LIMIT_EXCEEDED';
    this.retryAfter = options.retryAfter;
  }
}
