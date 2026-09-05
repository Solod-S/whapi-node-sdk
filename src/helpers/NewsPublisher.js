import { normalizeChannelId } from '../core/ids.js';
import { assertNonEmptyString, assertObject } from '../core/validation.js';
import { addUtm, formatArticlePost } from './text.js';

/**
 * High-level helper for publishing news articles and blog posts to WhatsApp Channels.
 */
export class NewsPublisher {
  /**
   * @param {import('../resources/ChannelsResource.js').ChannelsResource} channels
   */
  constructor(channels) {
    this.channels = channels;
  }

  /**
   * Publishes an article (with optional featured image, description, and UTM tags)
   * to a WhatsApp Channel.
   *
   * @param {object} params
   * @param {string} params.channelId - WhatsApp Channel ID
   * @param {string} params.title - Article title
   * @param {string} [params.description] - Article excerpt or text
   * @param {string|object|Buffer|Uint8Array} [params.image] - Featured image URL, buffer, or descriptor
   * @param {string} [params.url] - Article web URL
   * @param {object} [params.utm] - UTM parameters ({ source, medium, campaign, term, content })
   * @param {object} [params.formatting] - Formatting options ({ includeTitle, includeDescription, includeUrl, maxDescriptionLength })
   * @param {AbortSignal} [params.signal] - Caller abort signal
   * @returns {Promise<{
   *   success: boolean,
   *   channelId: string,
   *   type: 'image' | 'text',
   *   messageId?: string,
   *   url?: string,
   *   response: object
   * }>}
   */
  async publishArticle(params) {
    assertObject(params, 'article');

    const channelId = normalizeChannelId(params.channelId);
    const title = assertNonEmptyString(params.title, 'article.title');
    const { description, image, url, utm, formatting, signal, ...rest } = params;

    let finalUrl = url;
    if (url && utm) {
      finalUrl = addUtm(url, utm);
    }

    const postText = formatArticlePost({
      title,
      description,
      url: finalUrl,
      formatting,
    });

    let result;
    let postType;

    const hasImage = Boolean(
      image &&
      (typeof image === 'string'
        ? image.trim().length > 0
        : typeof image === 'object' || image instanceof Uint8Array),
    );

    if (hasImage) {
      postType = 'image';
      result = await this.channels.publishImage(channelId, image, {
        caption: postText,
        signal,
        ...rest,
      });
    } else {
      postType = 'text';
      result = await this.channels.publishText(channelId, postText, {
        signal,
        ...rest,
      });
    }

    const messageId = result?.message?.id || result?.id || undefined;

    return {
      success: true,
      channelId,
      type: postType,
      messageId,
      url: finalUrl,
      response: result,
    };
  }
}
