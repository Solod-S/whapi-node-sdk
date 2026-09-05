import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WebhooksResource } from '../../src/resources/WebhooksResource.js';

describe('resources/WebhooksResource', () => {
  let captured;
  const mockHttp = {
    request: async (p) => {
      captured = p;
      return { status: 'ok' };
    },
  };
  const webhooks = new WebhooksResource(mockHttp);

  it('getEvents() calls GET /settings/events', async () => {
    await webhooks.getEvents();
    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/settings/events');
  });

  it('test() calls POST /settings/webhook_test', async () => {
    await webhooks.test({ url: 'https://test.com', type: 'messages', mode: 'sync' });
    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/settings/webhook_test');
    assert.equal(captured.body.url, 'https://test.com');
  });

  it('parse() parses webhook payloads correctly', () => {
    const jsonStr = JSON.stringify({
      messages: [{ id: 'msg-1', body: 'hello' }],
      contacts: [{ id: 'contact-1' }],
    });

    const parsed = webhooks.parse(jsonStr);
    assert.equal(parsed.hasMessages, true);
    assert.equal(parsed.hasContacts, true);
    assert.equal(parsed.messages.length, 1);
    assert.equal(parsed.contacts.length, 1);
    assert.equal(parsed.statuses.length, 0);
  });
});
