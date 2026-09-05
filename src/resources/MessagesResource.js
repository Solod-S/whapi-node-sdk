import { normalizeRecipient } from '../core/ids.js';
import { assertNonEmptyString, assertArray, assertObject } from '../core/validation.js';
import { WhapiValidationError } from '../core/errors.js';
import { normalizeMediaInput } from '../helpers/media.js';

/**
 * Resource for sending and managing WhatsApp messages via Whapi.Cloud.
 */
export class MessagesResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Sends a plain text message.
   *
   * @param {string} to - Recipient (phone number, chat ID, or channel ID)
   * @param {string} text - Message text
   * @param {object} [options] - Additional parameters (e.g. typing_time, quoted, ephemeral, signal)
   * @returns {Promise<object>}
   */
  async sendText(to, text, options = {}) {
    const recipient = normalizeRecipient(to);
    const bodyText = assertNonEmptyString(text, 'text');
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/text',
      body: {
        to: recipient,
        body: bodyText,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends an image message.
   *
   * @param {string} to - Recipient
   * @param {string|object|Buffer|Uint8Array} image - Image URL, base64, buffer, or { source, caption }
   * @param {object} [options] - Additional parameters (caption, quoted, signal, etc.)
   * @returns {Promise<object>}
   */
  async sendImage(to, image, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(image, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/image',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a video message.
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} video
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendVideo(to, video, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(video, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/video',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a short round video note message.
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} video
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendShortVideo(to, video, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(video, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/short',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a GIF message.
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} gif
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendGif(to, gif, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(gif, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/gif',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends an audio message.
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} audio
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendAudio(to, audio, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(audio, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/audio',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a voice message (PTT note).
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} audio
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendVoice(to, audio, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(audio, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/voice',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a document / file message.
   *
   * @param {string} to
   * @param {string|object|Buffer|Uint8Array} document
   * @param {object} [options] - filename, caption, signal
   * @returns {Promise<object>}
   */
  async sendDocument(to, document, options = {}) {
    const recipient = normalizeRecipient(to);
    const mediaPayload = normalizeMediaInput(document, options);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/document',
      body: {
        to: recipient,
        ...mediaPayload,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a rich link preview message.
   *
   * @param {string} to
   * @param {string} url - Link URL to preview
   * @param {object} [options] - title, description, preview (base64 image), signal
   * @returns {Promise<object>}
   */
  async sendLinkPreview(to, url, options = {}) {
    const recipient = normalizeRecipient(to);
    const bodyUrl = assertNonEmptyString(url, 'url');
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/link_preview',
      body: {
        to: recipient,
        body: bodyUrl,
        title: rest.title || bodyUrl,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a geographic location message.
   *
   * @param {string} to
   * @param {object} location - { latitude, longitude, name, address }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendLocation(to, location, options = {}) {
    const recipient = normalizeRecipient(to);
    assertObject(location, 'location');
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/location',
      body: {
        to: recipient,
        latitude: location.latitude,
        longitude: location.longitude,
        name: location.name,
        address: location.address,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a live location message.
   *
   * @param {string} to
   * @param {object} location - { latitude, longitude, accuracy, speed, degrees }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendLiveLocation(to, location, options = {}) {
    const recipient = normalizeRecipient(to);
    assertObject(location, 'location');
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/live_location',
      body: {
        to: recipient,
        latitude: location.latitude,
        longitude: location.longitude,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a contact vCard message.
   *
   * @param {string} to
   * @param {object|string} contact - { name, vcard } or name string
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendContact(to, contact, options = {}) {
    const recipient = normalizeRecipient(to);
    const { signal, ...rest } = options;

    const body =
      typeof contact === 'string'
        ? { to: recipient, name: contact, ...rest }
        : { to: recipient, ...contact, ...rest };

    return this.http.request({
      method: 'POST',
      path: '/messages/contact',
      body,
      signal,
    });
  }

  /**
   * Sends a poll message.
   *
   * @param {string} to
   * @param {object} poll - { title|question, options: string[], multiple_answers?: boolean }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendPoll(to, poll, options = {}) {
    const recipient = normalizeRecipient(to);
    assertObject(poll, 'poll');
    const title = assertNonEmptyString(poll.title || poll.question, 'poll.title');
    const pollOptions = assertArray(poll.options, 'poll.options', 2);
    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/poll',
      body: {
        to: recipient,
        title,
        options: pollOptions,
        ...poll,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Sends a question card to a WhatsApp Channel.
   *
   * @param {string} to
   * @param {string|object} question - Question text or { body, ... }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendQuestion(to, question, options = {}) {
    const recipient = normalizeRecipient(to);
    const { signal, ...rest } = options;

    const body =
      typeof question === 'string'
        ? { to: recipient, body: assertNonEmptyString(question, 'question'), ...rest }
        : {
            to: recipient,
            body: assertNonEmptyString(question.body || question.text, 'question.body'),
            ...question,
            ...rest,
          };

    return this.http.request({
      method: 'POST',
      path: '/messages/question',
      body,
      signal,
    });
  }

  /**
   * Sends an interactive quiz to a WhatsApp Channel.
   *
   * @param {string} to
   * @param {object} quiz - { title|question, options: string[], correct_option_index: number }
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async sendQuiz(to, quiz, options = {}) {
    const recipient = normalizeRecipient(to);
    assertObject(quiz, 'quiz');
    const title = assertNonEmptyString(quiz.title || quiz.question, 'quiz.title');
    const quizOptions = assertArray(quiz.options, 'quiz.options', 2);
    const correctIndex = quiz.correct_option_index ?? quiz.correctOptionIndex;

    if (
      typeof correctIndex !== 'number' ||
      correctIndex < 0 ||
      correctIndex >= quizOptions.length
    ) {
      throw new WhapiValidationError(
        `"correct_option_index" must be a valid option index (0 to ${quizOptions.length - 1})`,
        { field: 'correct_option_index', value: correctIndex },
      );
    }

    const { signal, ...rest } = options;

    return this.http.request({
      method: 'POST',
      path: '/messages/quiz',
      body: {
        to: recipient,
        title,
        options: quizOptions,
        correct_option_index: correctIndex,
        ...quiz,
        ...rest,
      },
      signal,
    });
  }

  /**
   * Generic message dispatcher.
   *
   * @param {object} payload - Message descriptor
   * @param {string} payload.to - Recipient
   * @param {string} payload.type - Message type ('text', 'image', 'video', 'poll', etc.)
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async send(payload, options = {}) {
    assertObject(payload, 'payload');
    const { to, type, ...rest } = payload;
    const recipient = normalizeRecipient(to);
    const msgType = assertNonEmptyString(type, 'payload.type').toLowerCase();

    switch (msgType) {
      case 'text':
        return this.sendText(recipient, rest.text || rest.body, { ...rest, ...options });

      case 'image':
        return this.sendImage(recipient, rest.media || rest.source || rest.image, {
          caption: rest.caption,
          ...rest,
          ...options,
        });

      case 'video':
        return this.sendVideo(recipient, rest.media || rest.source || rest.video, {
          caption: rest.caption,
          ...rest,
          ...options,
        });

      case 'short':
      case 'short_video':
        return this.sendShortVideo(recipient, rest.media || rest.source || rest.video, {
          ...rest,
          ...options,
        });

      case 'gif':
        return this.sendGif(recipient, rest.media || rest.source || rest.gif, {
          caption: rest.caption,
          ...rest,
          ...options,
        });

      case 'audio':
        return this.sendAudio(recipient, rest.media || rest.source || rest.audio, {
          ...rest,
          ...options,
        });

      case 'voice':
        return this.sendVoice(recipient, rest.media || rest.source || rest.audio, {
          ...rest,
          ...options,
        });

      case 'document':
      case 'file':
        return this.sendDocument(recipient, rest.media || rest.source || rest.document, {
          ...rest,
          ...options,
        });

      case 'link':
      case 'link_preview':
        return this.sendLinkPreview(recipient, rest.url || rest.body, {
          title: rest.title,
          description: rest.description,
          ...rest,
          ...options,
        });

      case 'location':
        return this.sendLocation(recipient, rest.location || rest, options);

      case 'live_location':
        return this.sendLiveLocation(recipient, rest.location || rest, options);

      case 'contact':
        return this.sendContact(recipient, rest.contact || rest, options);

      case 'poll':
        return this.sendPoll(recipient, rest, options);

      case 'question':
        return this.sendQuestion(recipient, rest.question || rest, options);

      case 'quiz':
        return this.sendQuiz(recipient, rest.quiz || rest, options);

      default:
        throw new WhapiValidationError(`Unknown or unsupported message type: "${type}"`, {
          field: 'type',
          value: type,
        });
    }
  }

  /**
   * Retrieves messages list across all chats.
   *
   * @param {object} [query] - count, offset, time_from, time_to, chat_type, sort
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async list(query = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/messages/list',
      query,
      signal: options.signal,
    });
  }

  /**
   * Retrieves messages for a specific chat.
   *
   * @param {string} chatId
   * @param {object} [query]
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async listByChat(chatId, query = {}, options = {}) {
    const id = assertNonEmptyString(chatId, 'chatId');
    return this.http.request({
      method: 'GET',
      path: `/messages/list/${encodeURIComponent(id)}`,
      query,
      signal: options.signal,
    });
  }

  /**
   * Retrieves a single message by ID.
   *
   * @param {string} messageId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async get(messageId, options = {}) {
    const id = assertNonEmptyString(messageId, 'messageId');
    return this.http.request({
      method: 'GET',
      path: `/messages/${encodeURIComponent(id)}`,
      signal: options.signal,
    });
  }

  /**
   * Deletes a message by ID.
   *
   * @param {string} messageId
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async delete(messageId, options = {}) {
    const id = assertNonEmptyString(messageId, 'messageId');
    return this.http.request({
      method: 'DELETE',
      path: `/messages/${encodeURIComponent(id)}`,
      signal: options.signal,
    });
  }
}
