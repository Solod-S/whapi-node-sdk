import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { HttpClient } from '../../src/core/HttpClient.js';
import {
  WhapiApiError,
  WhapiRateLimitError,
  WhapiTimeoutError,
  WhapiNetworkError,
  WhapiValidationError,
} from '../../src/core/errors.js';

describe('core/HttpClient', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fails fast if token is missing or empty', () => {
    assert.throws(() => new HttpClient({ token: '' }), WhapiValidationError);
    assert.throws(() => new HttpClient({ token: null }), WhapiValidationError);
    assert.throws(() => new HttpClient({}), WhapiValidationError);
  });

  it('normalizes base URL and trims trailing slashes', () => {
    const client = new HttpClient({
      token: 'test-token',
      baseUrl: 'https://custom.whapi.cloud/',
    });
    assert.equal(client.baseUrl, 'https://custom.whapi.cloud');
    assert.equal(client.buildUrl('/messages/text'), 'https://custom.whapi.cloud/messages/text');
  });

  it('sends Authorization: Bearer token and JSON headers', async () => {
    let capturedUrl;
    let capturedOptions;

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return new Response(JSON.stringify({ sent: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = new HttpClient({ token: 'my-secret-token' });
    const result = await client.request({
      method: 'POST',
      path: '/messages/text',
      body: { to: '123', body: 'hello' },
    });

    assert.equal(result.sent, true);
    assert.equal(capturedUrl, 'https://gate.whapi.cloud/messages/text');
    assert.equal(capturedOptions.method, 'POST');
    assert.equal(capturedOptions.headers.Authorization, 'Bearer my-secret-token');
    assert.equal(capturedOptions.headers['Content-Type'], 'application/json; charset=utf-8');
    assert.equal(capturedOptions.body, JSON.stringify({ to: '123', body: 'hello' }));
  });

  it('correctly appends query parameters including arrays and skips null/undefined', async () => {
    let capturedUrl;

    globalThis.fetch = async (url) => {
      capturedUrl = url;
      return new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = new HttpClient({ token: 'test-token' });
    await client.request({
      method: 'GET',
      path: '/messages/list',
      query: { count: 50, offset: 0, labels: ['vip', 'news'], empty: undefined, ignored: null },
    });

    const parsed = new URL(capturedUrl);
    assert.equal(parsed.searchParams.get('count'), '50');
    assert.equal(parsed.searchParams.get('offset'), '0');
    assert.deepEqual(parsed.searchParams.getAll('labels'), ['vip', 'news']);
    assert.equal(parsed.searchParams.has('empty'), false);
    assert.equal(parsed.searchParams.has('ignored'), false);
  });

  it('handles 204 No Content response gracefully', async () => {
    globalThis.fetch = async () => {
      return new Response(null, { status: 204 });
    };

    const client = new HttpClient({ token: 'test-token' });
    const result = await client.request({
      method: 'DELETE',
      path: '/newsletters/123@newsletter',
    });

    assert.deepEqual(result, {});
  });

  it('handles non-JSON 2xx responses gracefully', async () => {
    globalThis.fetch = async () => {
      return new Response('plain text response', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    };

    const client = new HttpClient({ token: 'test-token' });
    const result = await client.request({
      method: 'GET',
      path: '/health',
    });

    assert.equal(result, 'plain text response');
  });

  it('parses 400 Bad Request into WhapiApiError with details', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 4001,
            message: 'Wrong request parameters',
            details: 'Recipient "to" is invalid',
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    };

    const client = new HttpClient({ token: 'test-token' });

    await assert.rejects(
      () => client.request({ method: 'POST', path: '/messages/text', body: {} }),
      (err) => {
        assert.ok(err instanceof WhapiApiError);
        assert.equal(err.status, 400);
        assert.equal(err.code, 4001);
        assert.equal(err.message, 'Wrong request parameters');
        assert.equal(err.details, 'Recipient "to" is invalid');
        return true;
      },
    );
  });

  it('parses 401 Unauthorized into WhapiApiError', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 401,
            message: 'Need channel authorization',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    };

    const client = new HttpClient({ token: 'invalid-token' });
    await assert.rejects(
      () => client.request({ method: 'GET', path: '/health' }),
      (err) => {
        assert.ok(err instanceof WhapiApiError);
        assert.equal(err.status, 401);
        return true;
      },
    );
  });

  it('parses 429 Too Many Requests into WhapiRateLimitError with retryAfter', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 429,
            message: 'Rate limit exceeded',
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '2',
          },
        },
      );
    };

    const client = new HttpClient({
      token: 'test-token',
      retry: { enabled: false }, // disable retry for single assertion
    });

    await assert.rejects(
      () => client.request({ method: 'POST', path: '/messages/text', body: {} }),
      (err) => {
        assert.ok(err instanceof WhapiRateLimitError);
        assert.equal(err.status, 429);
        assert.equal(err.retryAfter, 2000);
        return true;
      },
    );
  });

  it('parses 500 Internal Server Error into WhapiApiError with retryable=true', async () => {
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            code: 500,
            message: 'Internal error',
          },
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    };

    const client = new HttpClient({
      token: 'test-token',
      retry: { enabled: false },
    });

    await assert.rejects(
      () => client.request({ method: 'GET', path: '/health' }),
      (err) => {
        assert.ok(err instanceof WhapiApiError);
        assert.equal(err.status, 500);
        assert.equal(err.retryable, true);
        return true;
      },
    );
  });

  it('handles low-level network failure as WhapiNetworkError', async () => {
    globalThis.fetch = async () => {
      throw new TypeError('Failed to fetch');
    };

    const client = new HttpClient({
      token: 'test-token',
      retry: { enabled: false },
    });

    await assert.rejects(
      () => client.request({ method: 'GET', path: '/health' }),
      (err) => {
        assert.ok(err instanceof WhapiNetworkError);
        assert.equal(err.retryable, true);
        return true;
      },
    );
  });

  it('handles timeout as WhapiTimeoutError', async () => {
    globalThis.fetch = async (_url, { signal }) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          const timeoutErr = new Error('The operation was aborted');
          timeoutErr.name = 'AbortError';
          reject(timeoutErr);
        });
      });
    };

    const client = new HttpClient({
      token: 'test-token',
      timeout: 50,
      retry: { enabled: false },
    });

    await assert.rejects(
      () => client.request({ method: 'GET', path: '/health' }),
      (err) => {
        assert.ok(err instanceof WhapiTimeoutError);
        assert.equal(err.timeoutMs, 50);
        return true;
      },
    );
  });

  it('supports caller AbortSignal to cancel requests', async () => {
    const controller = new AbortController();

    globalThis.fetch = async (_url, { signal }) => {
      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(signal.reason || new Error('Aborted'));
        });
      });
    };

    const client = new HttpClient({
      token: 'test-token',
      timeout: 5000,
      retry: { enabled: false },
    });

    setTimeout(() => controller.abort(new Error('User aborted request')), 30);

    await assert.rejects(
      () =>
        client.request({
          method: 'GET',
          path: '/health',
          signal: controller.signal,
        }),
      /User aborted request/,
    );
  });

  it('redacts secret token in logged messages and error responses', async () => {
    const logMessages = [];
    const mockLogger = {
      debug: (...args) => logMessages.push(args.join(' ')),
      info: (...args) => logMessages.push(args.join(' ')),
      warn: (...args) => logMessages.push(args.join(' ')),
      error: (...args) => logMessages.push(args.join(' ')),
    };

    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          error: {
            message: 'Token secret-12345 is invalid',
          },
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    };

    const client = new HttpClient({
      token: 'secret-12345',
      logger: mockLogger,
      retry: { enabled: false },
    });

    try {
      await client.request({ method: 'GET', path: '/health' });
      assert.fail('Should have failed');
    } catch (err) {
      // Error message or JSON should have redacted the secret token
      const serialized = JSON.stringify(err);
      assert.ok(!serialized.includes('secret-12345'));
    }

    // Verify logger never logged the secret
    const allLogs = logMessages.join('\n');
    assert.ok(!allLogs.includes('secret-12345'));
  });
});
