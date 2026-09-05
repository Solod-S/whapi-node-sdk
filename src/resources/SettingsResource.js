import { assertObject } from '../core/validation.js';

/**
 * Resource for managing Whapi channel settings and webhook configuration.
 */
export class SettingsResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Retrieves the current channel/session settings.
   *
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<object>}
   */
  async get(options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/settings',
      signal: options.signal,
    });
  }

  /**
   * Updates channel settings. Only provided fields will be modified.
   *
   * @param {object} settings - Settings object to update
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<object>}
   */
  async update(settings, options = {}) {
    assertObject(settings, 'settings');
    return this.http.request({
      method: 'PATCH',
      path: '/settings',
      body: settings,
      signal: options.signal,
    });
  }

  /**
   * Resets channel settings to their defaults.
   *
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<object>}
   */
  async reset(options = {}) {
    return this.http.request({
      method: 'DELETE',
      path: '/settings',
      signal: options.signal,
    });
  }

  /**
   * Retrieves available webhook events supported by Whapi.
   *
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
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
   * @param {object} payload - Webhook test request payload
   * @param {string} payload.url - Target webhook URL
   * @param {string} payload.type - Event type to test
   * @param {string} payload.mode - Mode ('sync' or 'async')
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<object>}
   */
  async testWebhook(payload, options = {}) {
    assertObject(payload, 'payload');
    return this.http.request({
      method: 'POST',
      path: '/settings/webhook_test',
      body: payload,
      signal: options.signal,
    });
  }
}
