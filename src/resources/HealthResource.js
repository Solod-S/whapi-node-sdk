/**
 * Resource for checking Whapi channel health and instance state.
 */
export class HealthResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Checks the health and operational status of the Whapi instance.
   *
   * @param {object} [params] - Query parameters
   * @param {boolean} [params.wakeup] - Attempt to wake up the channel
   * @param {string} [params.platform] - Filter by platform
   * @param {string} [params.channel_type] - Channel type
   * @param {object} [options]
   * @param {AbortSignal} [options.signal] - Caller abort signal
   * @returns {Promise<object>}
   */
  async check(params = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/health',
      query: params,
      signal: options.signal,
    });
  }
}
