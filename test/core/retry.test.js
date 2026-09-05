import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { shouldRetry, calculateBackoff, parseRetryAfter, sleep } from '../../src/core/retry.js';
import {
  WhapiApiError,
  WhapiRateLimitError,
  WhapiTimeoutError,
  WhapiNetworkError,
  WhapiValidationError,
} from '../../src/core/errors.js';

describe('core/retry', () => {
  describe('shouldRetry', () => {
    it('retries GET requests on network errors or timeouts', () => {
      const netErr = new WhapiNetworkError('Failed');
      assert.equal(shouldRetry({ method: 'GET', error: netErr, attempt: 1, maxAttempts: 3 }), true);

      const timeoutErr = new WhapiTimeoutError('Timeout');
      assert.equal(
        shouldRetry({ method: 'GET', error: timeoutErr, attempt: 1, maxAttempts: 3 }),
        true,
      );
    });

    it('retries GET requests on 429 and 5xx errors', () => {
      const rateLimitErr = new WhapiRateLimitError('Rate limited');
      assert.equal(
        shouldRetry({ method: 'GET', error: rateLimitErr, attempt: 1, maxAttempts: 3 }),
        true,
      );

      const serverErr = new WhapiApiError('Internal Server Error', { status: 500 });
      assert.equal(
        shouldRetry({ method: 'GET', error: serverErr, attempt: 1, maxAttempts: 3 }),
        true,
      );

      const badGateway = new WhapiApiError('Bad Gateway', { status: 502 });
      assert.equal(
        shouldRetry({ method: 'GET', error: badGateway, attempt: 1, maxAttempts: 3 }),
        true,
      );
    });

    it('does NOT retry normal client 4xx errors', () => {
      const badReq = new WhapiApiError('Bad Request', { status: 400 });
      assert.equal(
        shouldRetry({ method: 'GET', error: badReq, attempt: 1, maxAttempts: 3 }),
        false,
      );

      const notFound = new WhapiApiError('Not Found', { status: 404 });
      assert.equal(
        shouldRetry({ method: 'GET', error: notFound, attempt: 1, maxAttempts: 3 }),
        false,
      );

      const valErr = new WhapiValidationError('Validation failed');
      assert.equal(
        shouldRetry({ method: 'GET', error: valErr, attempt: 1, maxAttempts: 3 }),
        false,
      );
    });

    it('does NOT retry POST requests by default (unsafe retry prevention)', () => {
      const netErr = new WhapiNetworkError('Timeout during send');
      assert.equal(
        shouldRetry({
          method: 'POST',
          error: netErr,
          attempt: 1,
          maxAttempts: 3,
          retryUnsafeRequests: false,
        }),
        false,
      );

      const serverErr = new WhapiApiError('Server error', { status: 500 });
      assert.equal(
        shouldRetry({
          method: 'POST',
          error: serverErr,
          attempt: 1,
          maxAttempts: 3,
          retryUnsafeRequests: false,
        }),
        false,
      );
    });

    it('retries POST requests only when retryUnsafeRequests is explicitly enabled', () => {
      const netErr = new WhapiNetworkError('Timeout during send');
      assert.equal(
        shouldRetry({
          method: 'POST',
          error: netErr,
          attempt: 1,
          maxAttempts: 3,
          retryUnsafeRequests: true,
        }),
        true,
      );
    });

    it('stops retrying when attempt reaches maxAttempts', () => {
      const netErr = new WhapiNetworkError('Failed');
      assert.equal(
        shouldRetry({ method: 'GET', error: netErr, attempt: 3, maxAttempts: 3 }),
        false,
      );
    });
  });

  describe('calculateBackoff', () => {
    it('calculates deterministic delay when jitter is false', () => {
      const delay1 = calculateBackoff({ attempt: 1, minDelay: 500, jitter: false });
      assert.equal(delay1, 500);

      const delay2 = calculateBackoff({ attempt: 2, minDelay: 500, jitter: false });
      assert.equal(delay2, 1000);

      const delay3 = calculateBackoff({ attempt: 3, minDelay: 500, jitter: false });
      assert.equal(delay3, 2000);
    });

    it('respects maxDelay', () => {
      const delay = calculateBackoff({ attempt: 10, minDelay: 500, maxDelay: 3000, jitter: false });
      assert.equal(delay, 3000);
    });

    it('uses retryAfter if provided', () => {
      const delay = calculateBackoff({ attempt: 1, retryAfter: 4500, maxDelay: 5000 });
      assert.equal(delay, 4500);
    });
  });

  describe('parseRetryAfter', () => {
    it('parses seconds into milliseconds', () => {
      assert.equal(parseRetryAfter('5'), 5000);
      assert.equal(parseRetryAfter('0'), 0);
    });

    it('returns null for missing or invalid headers', () => {
      assert.equal(parseRetryAfter(null), null);
      assert.equal(parseRetryAfter(''), null);
      assert.equal(parseRetryAfter('invalid'), null);
    });
  });

  describe('sleep', () => {
    it('resolves after specified delay', async () => {
      const start = Date.now();
      await sleep(50);
      assert.ok(Date.now() - start >= 40);
    });

    it('aborts early if signal fires', async () => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new Error('User cancelled')), 20);

      await assert.rejects(() => sleep(500, controller.signal), /User cancelled/);
    });
  });
});
