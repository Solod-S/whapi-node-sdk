import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SettingsResource } from '../../src/resources/SettingsResource.js';

describe('resources/SettingsResource', () => {
  it('get() calls GET /settings', async () => {
    let captured;
    const mockHttp = {
      request: async (p) => {
        captured = p;
        return { webhooks: [] };
      },
    };

    const settings = new SettingsResource(mockHttp);
    const res = await settings.get();

    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/settings');
    assert.deepEqual(res, { webhooks: [] });
  });

  it('update() calls PATCH /settings with body', async () => {
    let captured;
    const mockHttp = {
      request: async (p) => {
        captured = p;
        return { updated: true };
      },
    };

    const settings = new SettingsResource(mockHttp);
    await settings.update({ auto_read_messages: true });

    assert.equal(captured.method, 'PATCH');
    assert.equal(captured.path, '/settings');
    assert.deepEqual(captured.body, { auto_read_messages: true });
  });

  it('reset() calls DELETE /settings', async () => {
    let captured;
    const mockHttp = {
      request: async (p) => {
        captured = p;
        return { success: true };
      },
    };

    const settings = new SettingsResource(mockHttp);
    await settings.reset();

    assert.equal(captured.method, 'DELETE');
    assert.equal(captured.path, '/settings');
  });

  it('getEvents() calls GET /settings/events', async () => {
    let captured;
    const mockHttp = {
      request: async (p) => {
        captured = p;
        return { events: ['messages', 'statuses'] };
      },
    };

    const settings = new SettingsResource(mockHttp);
    const res = await settings.getEvents();

    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/settings/events');
    assert.ok(res.events.includes('messages'));
  });

  it('testWebhook() calls POST /settings/webhook_test', async () => {
    let captured;
    const mockHttp = {
      request: async (p) => {
        captured = p;
        return { status: 200 };
      },
    };

    const settings = new SettingsResource(mockHttp);
    await settings.testWebhook({
      url: 'https://example.com/webhook',
      type: 'messages',
      mode: 'sync',
    });

    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/settings/webhook_test');
    assert.equal(captured.body.url, 'https://example.com/webhook');
  });
});
