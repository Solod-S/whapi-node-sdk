import { normalizeChannelId } from '../core/ids.js';
import { assertObject, assertNonEmptyString } from '../core/validation.js';

/**
 * Resource for managing WhatsApp Channels (Newsletters) and publishing posts.
 */
export class ChannelsResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   * @param {import('./MessagesResource.js').MessagesResource} messages
   */
  constructor(http, messages) {
    this.http = http;
    this.messages = messages;
  }

  /**
   * Lists WhatsApp Channels/Newsletters owned or followed by the account.
   *
   * @param {object} [query] - Pagination query ({ count, offset })
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async list(query = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/newsletters',
      query,
      signal: options.signal,
    });
  }

  /**
   * Retrieves metadata and information for a specific WhatsApp Channel.
   *
   * @param {string} channelId - Channel ID (e.g. 120363... or 120363...@newsletter)
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async get(channelId, options = {}) {
    const id = normalizeChannelId(channelId);
    return this.http.request({
      method: 'GET',
      path: `/newsletters/${encodeURIComponent(id)}`,
      signal: options.signal,
    });
  }

  /**
   * Creates a new WhatsApp Channel.
   *
   * @param {object} data - Newsletter creation payload ({ name, description, picture })
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async create(data, options = {}) {
    assertObject(data, 'data');
    assertNonEmptyString(data.name, 'data.name');

    return this.http.request({
      method: 'POST',
      path: '/newsletters',
      body: data,
      signal: options.signal,
    });
  }

  /**
   * Updates an existing WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} data - Fields to update ({ name, description, picture })
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async update(channelId, data, options = {}) {
    const id = normalizeChannelId(channelId);
    assertObject(data, 'data');

    return this.http.request({
      method: 'PATCH',
      path: `/newsletters/${encodeURIComponent(id)}`,
      body: data,
      signal: options.signal,
    });
  }

  /**
   * Deletes a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async delete(channelId, options = {}) {
    const id = normalizeChannelId(channelId);

    return this.http.request({
      method: 'DELETE',
      path: `/newsletters/${encodeURIComponent(id)}`,
      signal: options.signal,
    });
  }

  /**
   * Subscribes to (follows) a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async subscribe(channelId, options = {}) {
    const id = normalizeChannelId(channelId);

    return this.http.request({
      method: 'POST',
      path: `/newsletters/${encodeURIComponent(id)}/subscription`,
      signal: options.signal,
    });
  }

  /**
   * Unsubscribes from (unfollows) a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async unsubscribe(channelId, options = {}) {
    const id = normalizeChannelId(channelId);

    return this.http.request({
      method: 'DELETE',
      path: `/newsletters/${encodeURIComponent(id)}/subscription`,
      signal: options.signal,
    });
  }

  /**
   * Subscribes to a channel using an invite code.
   *
   * @param {string} inviteCode
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async subscribeByInvite(inviteCode, options = {}) {
    const code = assertNonEmptyString(inviteCode, 'inviteCode');

    return this.http.request({
      method: 'POST',
      path: `/newsletters/invite/${encodeURIComponent(code)}/subscription`,
      signal: options.signal,
    });
  }

  /**
   * Unsubscribes from a channel using an invite code.
   *
   * @param {string} inviteCode
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async unsubscribeByInvite(inviteCode, options = {}) {
    const code = assertNonEmptyString(inviteCode, 'inviteCode');

    return this.http.request({
      method: 'DELETE',
      path: `/newsletters/invite/${encodeURIComponent(code)}/subscription`,
      signal: options.signal,
    });
  }

  /**
   * Searches for public WhatsApp Channels by filters.
   *
   * @param {object} [params] - country_code, search, count, cursor, sort
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async find(params = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/newsletters/find',
      query: params,
      signal: options.signal,
    });
  }

  /**
   * Retrieves recommended WhatsApp Channels for a country.
   *
   * @param {object} [params] - country_code, count, cursor
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getRecommended(params = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/newsletters/recommended',
      query: params,
      signal: options.signal,
    });
  }

  /**
   * Gets Channel info by an invite code.
   *
   * @param {string} inviteCode
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getInviteLink(inviteCode, options = {}) {
    const code = assertNonEmptyString(inviteCode, 'inviteCode');

    return this.http.request({
      method: 'GET',
      path: `/newsletters/link/${encodeURIComponent(code)}`,
      signal: options.signal,
    });
  }

  /**
   * Subscribes to channel updates (e.g. poll votes).
   *
   * @param {string} channelId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async track(channelId, options = {}) {
    const id = normalizeChannelId(channelId);

    return this.http.request({
      method: 'POST',
      path: `/newsletters/${encodeURIComponent(id)}/tracking`,
      signal: options.signal,
    });
  }

  /**
   * Marks a channel post as a paid partnership.
   *
   * @param {string} channelId
   * @param {string} messageId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async markPaidPartnership(channelId, messageId, options = {}) {
    const id = normalizeChannelId(channelId);
    const msgId = assertNonEmptyString(messageId, 'messageId');

    return this.http.request({
      method: 'POST',
      path: `/newsletters/${encodeURIComponent(id)}/messages/${encodeURIComponent(msgId)}/paid_partnership`,
      signal: options.signal,
    });
  }

  /**
   * Retrieves posts / message history for a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} [query] - count, before, after
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async getPosts(channelId, query = {}, options = {}) {
    const id = normalizeChannelId(channelId);

    return this.http.request({
      method: 'GET',
      path: `/newsletters/${encodeURIComponent(id)}/messages`,
      query,
      signal: options.signal,
    });
  }

  /**
   * Asynchronously iterates through channel posts with automatic pagination.
   *
   * @param {string} channelId
   * @param {object} [options]
   * @param {number} [options.pageSize=50]
   * @param {number} [options.limit=Infinity] - Maximum number of posts to yield
   * @param {AbortSignal} [options.signal]
   * @returns {AsyncGenerator<object, void, undefined>}
   */
  async *iteratePosts(channelId, options = {}) {
    const pageSize =
      typeof options.pageSize === 'number' && options.pageSize > 0 ? options.pageSize : 50;
    const limit = typeof options.limit === 'number' && options.limit > 0 ? options.limit : Infinity;
    const signal = options.signal;

    let yieldedCount = 0;
    let beforeCursor = undefined;
    let previousFirstId = null;

    while (yieldedCount < limit) {
      if (signal?.aborted) {
        throw signal.reason || new Error('Aborted');
      }

      const query = { count: pageSize };
      if (beforeCursor !== undefined) {
        query.before = beforeCursor;
      }

      const result = await this.getPosts(channelId, query, { signal });
      const messages = Array.isArray(result?.messages)
        ? result.messages
        : Array.isArray(result)
          ? result
          : [];

      if (!messages || messages.length === 0) {
        break;
      }

      // Check for pagination cycle or loop
      const currentFirstId = messages[0]?.id;
      if (currentFirstId && currentFirstId === previousFirstId) {
        break;
      }
      previousFirstId = currentFirstId;

      for (const msg of messages) {
        yield msg;
        yieldedCount += 1;
        if (yieldedCount >= limit) {
          return;
        }
      }

      // If we received fewer messages than requested, we reached the end
      if (messages.length < pageSize) {
        break;
      }

      // Whapi pagination for messages uses the timestamp or sequence of the oldest/newest message
      const lastMsg = messages[messages.length - 1];
      const nextBefore = lastMsg?.timestamp || lastMsg?.id;
      if (!nextBefore || nextBefore === beforeCursor) {
        break;
      }
      beforeCursor = nextBefore;
    }
  }

  // --- Channel Publishing Helpers (delegate to this.messages) ---

  /**
   * Publishes a text post to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string} text
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishText(channelId, text, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendText(to, text, options);
  }

  /**
   * Publishes an image post to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string|object|Buffer|Uint8Array} image - Image URL, base64, buffer, or { source, caption }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishImage(channelId, image, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendImage(to, image, options);
  }

  /**
   * Publishes a video post to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string|object|Buffer|Uint8Array} video
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishVideo(channelId, video, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendVideo(to, video, options);
  }

  /**
   * Publishes a rich link preview to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string} url
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishLink(channelId, url, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendLinkPreview(to, url, options);
  }

  /**
   * Publishes a voice/audio message to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string|object|Buffer|Uint8Array} audio
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishVoice(channelId, audio, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendVoice(to, audio, options);
  }

  /**
   * Publishes a poll to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} poll - { title|question, options: string[], multiple_answers?: boolean }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishPoll(channelId, poll, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendPoll(to, poll, options);
  }

  /**
   * Publishes a question card to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {string|object} question
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishQuestion(channelId, question, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendQuestion(to, question, options);
  }

  /**
   * Publishes an interactive quiz to a WhatsApp Channel.
   *
   * @param {string} channelId
   * @param {object} quiz - { title|question, options: string[], correct_option_index: number }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publishQuiz(channelId, quiz, options = {}) {
    const to = normalizeChannelId(channelId);
    return this.messages.sendQuiz(to, quiz, options);
  }

  /**
   * Generic channel post publisher. Normalizes channel ID and delegates to messages.send().
   *
   * @param {string} channelId
   * @param {object} payload - Post payload ({ type, text, media, caption, ... })
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async publish(channelId, payload, options = {}) {
    const to = normalizeChannelId(channelId);
    assertObject(payload, 'payload');

    return this.messages.send(
      {
        ...payload,
        to,
      },
      options,
    );
  }
}
