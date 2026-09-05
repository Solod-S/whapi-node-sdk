import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  WhapiError,
  WhapiApiError,
  WhapiValidationError,
  WhapiTimeoutError,
  WhapiNetworkError,
  WhapiRateLimitError,
} from '../../src/core/errors.js';

describe('core/errors', () => {
  it('WhapiError sets base properties correctly', () => {
    const err = new WhapiError('Base error message', { code: 'CUSTOM_CODE' });
    assert.equal(err.name, 'WhapiError');
    assert.equal(err.message, 'Base error message');
    assert.equal(err.code, 'CUSTOM_CODE');
    assert.ok(err instanceof Error);
  });

  it('WhapiApiError sets HTTP status and details', () => {
    const err = new WhapiApiError('Bad Request', {
      status: 400,
      code: 1001,
      details: 'Invalid parameter "to"',
      method: 'POST',
      endpoint: '/messages/text',
      requestId: 'req-123',
    });

    assert.equal(err.name, 'WhapiApiError');
    assert.equal(err.status, 400);
    assert.equal(err.code, 1001);
    assert.equal(err.details, 'Invalid parameter "to"');
    assert.equal(err.method, 'POST');
    assert.equal(err.endpoint, '/messages/text');
    assert.equal(err.requestId, 'req-123');
    assert.equal(err.retryable, false);

    const json = err.toJSON();
    assert.equal(json.status, 400);
    assert.equal(json.code, 1001);
  });

  it('WhapiValidationError includes field and value', () => {
    const err = new WhapiValidationError('Missing required field', {
      field: 'token',
      value: undefined,
    });
    assert.equal(err.name, 'WhapiValidationError');
    assert.equal(err.field, 'token');
    assert.equal(err.code, 'VALIDATION_ERROR');
    assert.ok(err instanceof WhapiError);
  });

  it('WhapiTimeoutError sets timeoutMs and retryable', () => {
    const err = new WhapiTimeoutError('Timed out', {
      timeoutMs: 5000,
      method: 'GET',
      endpoint: '/health',
    });
    assert.equal(err.name, 'WhapiTimeoutError');
    assert.equal(err.timeoutMs, 5000);
    assert.equal(err.retryable, true);
    assert.ok(err instanceof WhapiError);
  });

  it('WhapiNetworkError sets network cause and retryable', () => {
    const cause = new Error('getaddrinfo ENOTFOUND gate.whapi.cloud');
    const err = new WhapiNetworkError('Network failure', {
      method: 'GET',
      endpoint: '/health',
      cause,
    });
    assert.equal(err.name, 'WhapiNetworkError');
    assert.equal(err.cause, cause);
    assert.equal(err.retryable, true);
  });

  it('WhapiRateLimitError sets status 429 and retryAfter', () => {
    const err = new WhapiRateLimitError('Too many requests', {
      retryAfter: 3000,
      endpoint: '/messages/text',
    });
    assert.equal(err.name, 'WhapiRateLimitError');
    assert.equal(err.status, 429);
    assert.equal(err.retryAfter, 3000);
    assert.equal(err.retryable, true);
    assert.ok(err instanceof WhapiApiError);
    assert.ok(err instanceof WhapiError);
  });
});
