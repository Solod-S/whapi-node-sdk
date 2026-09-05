import { assertObject } from '../core/validation.js';

/**
 * Resource for Whapi webhook configuration, testing, and event parsing.
 */
export class WebhooksResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Retrieves all available webhook events supported by Whapi.
   *
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getEvents(options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/settings/events',
      signal: options.signal,
    });
  }

  /**
   * Sends a test webhook notification to the specified URL.
   *
   * @param {object} payload
   * @param {string} payload.url
   * @param {string} payload.type
   * @param {string} payload.mode
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async test(payload, options = {}) {
    assertObject(payload, 'payload');
    return this.http.request({
      method: 'POST',
      path: '/settings/webhook_test',
      body: payload,
      signal: options.signal,
    });
  }

  /**
   * Parses an incoming webhook payload into a structured event object.
   *
   * @param {string|object} payload
   * @returns {{
   *   raw: object,
   *   messages: Array<object>,
   *   contacts: Array<object>,
   *   statuses: Array<object>,
   *   hasMessages: boolean,
   *   hasContacts: boolean
   * }}
   */
  parse(payload) {
    let parsed;
    if (typeof payload === 'string') {
      try {
        parsed = JSON.parse(payload);
      } catch (_e) {
        parsed = { text: payload };
      }
    } else if (payload && typeof payload === 'object') {
      parsed = payload;
    } else {
      parsed = {};
    }

    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    const contacts = Array.isArray(parsed.contacts) ? parsed.contacts : [];
    const statuses = Array.isArray(parsed.statuses) ? parsed.statuses : [];

    return {
      raw: parsed,
      messages,
      contacts,
      statuses,
      hasMessages: messages.length > 0,
      hasContacts: contacts.length > 0,
    };
  }
}
