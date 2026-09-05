import { HttpClient } from './core/HttpClient.js';
import { HealthResource } from './resources/HealthResource.js';
import { SettingsResource } from './resources/SettingsResource.js';
import { MessagesResource } from './resources/MessagesResource.js';
import { ChannelsResource } from './resources/ChannelsResource.js';
import { MediaResource } from './resources/MediaResource.js';
import { WebhooksResource } from './resources/WebhooksResource.js';
import { NewsPublisher } from './helpers/NewsPublisher.js';
import { normalizeChannelId, normalizeRecipient, isChannelId } from './core/ids.js';
import { addUtm, truncateText, formatArticlePost } from './helpers/text.js';

/**
 * Main entry point for the Whapi.Cloud Node.js SDK.
 */
export class Whapi {
  /**
   * Initializes a new instance of the Whapi client.
   *
   * @param {object} options
   * @param {string} options.token - Whapi.Cloud API token (required)
   * @param {string} [options.baseUrl='https://gate.whapi.cloud'] - Whapi base gateway URL
   * @param {number} [options.timeout=30000] - Default request timeout in milliseconds
   * @param {object} [options.retry] - Retry policy options
   * @param {boolean} [options.retry.enabled=true] - Enable automatic retries
   * @param {number} [options.retry.attempts=3] - Maximum retry attempts
   * @param {number} [options.retry.minDelay=500] - Minimum retry backoff delay
   * @param {number} [options.retry.maxDelay=5000] - Maximum retry backoff delay
   * @param {boolean} [options.retry.retryUnsafeRequests=false] - Whether to retry non-idempotent requests (POST/PATCH/DELETE)
   * @param {object} [options.logger] - Custom logger (e.g. console) with debug/info/warn/error
   */
  constructor(options = {}) {
    /**
     * Underlying HTTP client.
     * @type {HttpClient}
     */
    this.http = new HttpClient(options);

    /**
     * Health check and instance operational status.
     * @type {HealthResource}
     */
    this.health = new HealthResource(this.http);

    /**
     * Channel settings and session configuration.
     * @type {SettingsResource}
     */
    this.settings = new SettingsResource(this.http);

    /**
     * Message management, private sending, media, and interactive messages.
     * @type {MessagesResource}
     */
    this.messages = new MessagesResource(this.http);

    /**
     * WhatsApp Channels / Newsletters management and post publishing.
     * @type {ChannelsResource}
     */
    this.channels = new ChannelsResource(this.http, this.messages);

    /**
     * Alias for `whapi.channels` for discoverability.
     * @type {ChannelsResource}
     */
    this.newsletters = this.channels;

    /**
     * Cloud media upload and inspection.
     * @type {MediaResource}
     */
    this.media = new MediaResource(this.http);

    /**
     * Webhook testing and event parsing.
     * @type {WebhooksResource}
     */
    this.webhooks = new WebhooksResource(this.http);

    /**
     * High-level helper for publishing articles from WordPress / CMS to Channels.
     * @type {NewsPublisher}
     */
    this.news = new NewsPublisher(this.channels);

    /**
     * ID normalization and text utilities.
     */
    this.utils = {
      normalizeChannelId,
      normalizeRecipient,
      isChannelId,
      addUtm,
      truncateText,
      formatArticlePost,
    };

    /**
     * Raw API escape hatch for making requests to undocumented or new Whapi endpoints.
     */
    this.raw = {
      /**
       * Sends an authenticated request to any Whapi endpoint.
       *
       * @param {object} params
       * @param {string} [params.method='GET']
       * @param {string} params.path - API path (e.g. '/calls/outgoing')
       * @param {Record<string, unknown>} [params.query]
       * @param {unknown} [params.body]
       * @param {Record<string, string>} [params.headers]
       * @param {AbortSignal} [params.signal]
       * @returns {Promise<any>}
       */
      request: (params) => this.http.request(params),
    };
  }
}
