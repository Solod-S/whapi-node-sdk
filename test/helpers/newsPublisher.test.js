import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NewsPublisher } from '../../src/helpers/NewsPublisher.js';
import { WhapiValidationError, WhapiApiError } from '../../src/core/errors.js';

describe('helpers/NewsPublisher', () => {
  it('publishes image article when image is present', async () => {
    let capturedMethod;
    let capturedArgs;

    const mockChannels = {
      publishImage: async (...args) => {
        capturedMethod = 'publishImage';
        capturedArgs = args;
        return { sent: true, message: { id: 'msg-img-1' } };
      },
      publishText: async (...args) => {
        capturedMethod = 'publishText';
        capturedArgs = args;
        return { sent: true };
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    const result = await publisher.publishArticle({
      channelId: '120363123456789',
      title: 'Apple announces new iPhone',
      description: 'The company revealed its latest device.',
      image: 'https://example.com/iphone.jpg',
      url: 'https://example.com/news/iphone',
      utm: {
        source: 'whatsapp',
        medium: 'channel',
        campaign: 'news',
      },
    });

    assert.equal(capturedMethod, 'publishImage');
    assert.equal(capturedArgs[0], '120363123456789@newsletter');
    assert.equal(capturedArgs[1], 'https://example.com/iphone.jpg');
    assert.ok(capturedArgs[2].caption.includes('Apple announces new iPhone'));
    assert.ok(capturedArgs[2].caption.includes('utm_source=whatsapp'));

    assert.equal(result.success, true);
    assert.equal(result.type, 'image');
    assert.equal(result.channelId, '120363123456789@newsletter');
    assert.equal(result.messageId, 'msg-img-1');
    assert.ok(result.url.includes('utm_campaign=news'));
  });

  it('falls back to text publishing when image is absent', async () => {
    let capturedMethod;
    let capturedArgs;

    const mockChannels = {
      publishImage: async () => {},
      publishText: async (...args) => {
        capturedMethod = 'publishText';
        capturedArgs = args;
        return { sent: true, message: { id: 'msg-text-2' } };
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    const result = await publisher.publishArticle({
      channelId: '120363123456789@newsletter',
      title: 'Breaking news without image',
      description: 'Detailed description here',
      url: 'https://example.com/news',
    });

    assert.equal(capturedMethod, 'publishText');
    assert.equal(capturedArgs[0], '120363123456789@newsletter');
    assert.ok(capturedArgs[1].includes('Breaking news without image'));

    assert.equal(result.success, true);
    assert.equal(result.type, 'text');
    assert.equal(result.messageId, 'msg-text-2');
  });

  it('preserves existing query parameters when adding UTM', async () => {
    let publishedCaption;

    const mockChannels = {
      publishText: async (_id, text) => {
        publishedCaption = text;
        return { sent: true, message: { id: 'msg-3' } };
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    await publisher.publishArticle({
      channelId: '120363123456789',
      title: 'Query params test',
      url: 'https://example.com/article?ref=homepage&id=101',
      utm: { source: 'whatsapp' },
    });

    assert.ok(publishedCaption.includes('ref=homepage'));
    assert.ok(publishedCaption.includes('id=101'));
    assert.ok(publishedCaption.includes('utm_source=whatsapp'));
  });

  it('handles Unicode and emojis cleanly in title and description', async () => {
    let publishedCaption;

    const mockChannels = {
      publishText: async (_id, text) => {
        publishedCaption = text;
        return { sent: true };
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    await publisher.publishArticle({
      channelId: '120363123456789',
      title: '🇺🇦 Новини технологій: ШІ та інновації 🚀',
      description: 'Сьогодні українські інженери представили нову систему 💡',
      url: 'https://example.com/news',
    });

    assert.ok(publishedCaption.includes('🇺🇦 Новини технологій: ШІ та інновації 🚀'));
    assert.ok(publishedCaption.includes('Сьогодні українські інженери'));
  });

  it('truncates description when maxDescriptionLength formatting option is provided', async () => {
    let publishedCaption;

    const mockChannels = {
      publishText: async (_id, text) => {
        publishedCaption = text;
        return { sent: true };
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    await publisher.publishArticle({
      channelId: '120363123456789',
      title: 'Truncation test',
      description: 'This is a long description text that should be cut off properly.',
      url: 'https://example.com',
      formatting: {
        maxDescriptionLength: 20,
      },
    });

    assert.ok(publishedCaption.includes('...'));
  });

  it('throws WhapiValidationError on missing title', async () => {
    const publisher = new NewsPublisher({});
    await assert.rejects(
      () =>
        publisher.publishArticle({
          channelId: '120363123456789',
          title: '',
        }),
      WhapiValidationError,
    );
  });

  it('throws WhapiValidationError on missing or invalid channelId', async () => {
    const publisher = new NewsPublisher({});
    await assert.rejects(
      () =>
        publisher.publishArticle({
          channelId: '',
          title: 'Some title',
        }),
      WhapiValidationError,
    );
  });

  it('propagates Whapi API errors without swallowing them', async () => {
    const mockChannels = {
      publishText: async () => {
        throw new WhapiApiError('Channel not found', { status: 404 });
      },
    };

    const publisher = new NewsPublisher(mockChannels);
    await assert.rejects(
      () =>
        publisher.publishArticle({
          channelId: '120363123456789',
          title: 'Some title',
        }),
      (err) => err instanceof WhapiApiError && err.status === 404,
    );
  });
});
