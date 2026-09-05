import {
  WhapiApiError,
  WhapiRateLimitError,
  WhapiTimeoutError,
  WhapiNetworkError,
} from './errors.js';

/**
 * Resolves after a given number of milliseconds, abortable via signal.
 *
 * @param {number} ms
 * @param {AbortSignal} [signal]
 * @returns {Promise<void>}
 */
export function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason || new Error('Aborted'));
      return;
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    function onAbort() {
      clearTimeout(timer);
      reject(signal?.reason || new Error('Aborted'));
    }

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Parses a Retry-After header into milliseconds.
 *
 * @param {string|null|undefined} header
 * @returns {number|null}
 */
export function parseRetryAfter(header) {
  if (!header) {
    return null;
  }

  // Check if it is a number of seconds
  const seconds = Number(header);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.round(seconds * 1000);
  }

  // Check if it is an HTTP date string
  const dateMs = Date.parse(header);
  if (!Number.isNaN(dateMs)) {
    const delay = dateMs - Date.now();
    return delay > 0 ? delay : 0;
  }

  return null;
}

/**
 * Determines whether a failed request should be retried.
 *
 * @param {object} params
 * @param {string} params.method - HTTP method (GET, POST, etc.)
 * @param {unknown} params.error - The error that occurred
 * @param {number} params.attempt - Current attempt number (1-based)
 * @param {number} params.maxAttempts - Maximum allowed attempts
 * @param {boolean} [params.retryUnsafeRequests=false] - Whether unsafe methods (POST/PATCH/DELETE) can be retried
 * @returns {boolean}
 */
export function shouldRetry({ method, error, attempt, maxAttempts, retryUnsafeRequests = false }) {
  if (attempt >= maxAttempts) {
    return false;
  }

  const upperMethod = (method || 'GET').toUpperCase();
  const isSafeMethod = upperMethod === 'GET' || upperMethod === 'HEAD' || upperMethod === 'OPTIONS';

  // If unsafe method and unsafe retries are disabled, do not retry
  if (!isSafeMethod && !retryUnsafeRequests) {
    return false;
  }

  // Network errors and timeouts are temporary
  if (error instanceof WhapiTimeoutError || error instanceof WhapiNetworkError) {
    return true;
  }

  // Rate limit 429
  if (error instanceof WhapiRateLimitError) {
    return true;
  }

  // Server-side errors 5xx
  if (error instanceof WhapiApiError) {
    if (error.status === 429) {
      return true;
    }
    if (error.status >= 500 && error.status <= 599) {
      return true;
    }
    // 4xx client errors (400, 401, 403, 404, etc.) are non-retryable
    return false;
  }

  return false;
}

/**
 * Calculates the backoff delay with optional jitter.
 *
 * @param {object} params
 * @param {number} params.attempt - 1-based attempt index
 * @param {number} [params.minDelay=500]
 * @param {number} [params.maxDelay=5000]
 * @param {number} [params.factor=2]
 * @param {boolean} [params.jitter=true]
 * @param {number|null} [params.retryAfter] - Explicit delay from Retry-After header
 * @returns {number}
 */
export function calculateBackoff({
  attempt,
  minDelay = 500,
  maxDelay = 5000,
  factor = 2,
  jitter = true,
  retryAfter = null,
}) {
  if (retryAfter !== null && retryAfter >= 0) {
    return Math.min(retryAfter, maxDelay * 2);
  }

  const exponential = minDelay * Math.pow(factor, Math.max(0, attempt - 1));
  const capped = Math.min(exponential, maxDelay);

  if (!jitter) {
    return capped;
  }

  // Full jitter: random value between minDelay/2 and capped
  const min = Math.max(50, Math.floor(minDelay / 2));
  return Math.floor(min + Math.random() * (capped - min + 1));
}
