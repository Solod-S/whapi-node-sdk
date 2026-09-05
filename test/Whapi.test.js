import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Whapi, WhapiError, WhapiApiError, WhapiValidationError } from '../src/index.js';

describe('Whapi Client', () => {
  it('instantiates client and binds resources', () => {
    const whapi = new Whapi({
      token: 'test-token-12345',
    });

    assert.ok(whapi.health);
    assert.ok(whapi.settings);
    assert.ok(whapi.messages);
    assert.ok(whapi.channels);
    assert.ok(whapi.newsletters);
    assert.equal(whapi.newsletters, whapi.channels);
    assert.ok(whapi.media);
    assert.ok(whapi.webhooks);
    assert.ok(whapi.news);
    assert.ok(whapi.utils);
    assert.ok(whapi.raw);
    assert.equal(typeof whapi.raw.request, 'function');
  });

  it('exports all standard error classes and utilities from root', () => {
    assert.ok(WhapiError);
    assert.ok(WhapiApiError);
    assert.ok(WhapiValidationError);
  });

  it('raw request escape hatch uses same transport', async () => {
    let captured;
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (url, options) => {
      captured = { url, options };
      return new Response(JSON.stringify({ custom: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    try {
      const whapi = new Whapi({ token: 'test-token' });
      const res = await whapi.raw.request({
        method: 'POST',
        path: '/some/new-feature',
        body: { feature: true },
      });

      assert.deepEqual(res, { custom: 'ok' });
      assert.equal(captured.url, 'https://gate.whapi.cloud/some/new-feature');
      assert.equal(captured.options.method, 'POST');
      assert.equal(captured.options.headers.Authorization, 'Bearer test-token');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
