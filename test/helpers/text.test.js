import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { truncateText, addUtm, formatArticlePost } from '../../src/helpers/text.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('helpers/text', () => {
  describe('truncateText', () => {
    it('returns original string if under maxLength', () => {
      assert.equal(truncateText('Short text', 20), 'Short text');
    });

    it('truncates at word boundary by default', () => {
      const result = truncateText('This is a longer paragraph that needs trimming', 25);
      assert.ok(result.length <= 25);
      assert.ok(result.endsWith('...'));
      assert.equal(result, 'This is a longer...');
    });

    it('safely handles Unicode surrogate pairs and emoji without splitting', () => {
      const emojiText = 'Breaking news! 🔥 🚀 🇺🇦 Special announcement';
      const truncated = truncateText(emojiText, 20);
      assert.ok(truncated.endsWith('...'));
      // Ensure no broken surrogate pairs
      assert.doesNotThrow(() => encodeURIComponent(truncated));
    });

    it('allows custom ellipsis', () => {
      assert.equal(
        truncateText('Hello world from Node.js', 15, { ellipsis: ' [more]' }),
        'Hello [more]',
      );
    });
  });

  describe('addUtm', () => {
    it('appends standard UTM parameters to URL', () => {
      const result = addUtm('https://example.com/news', {
        source: 'whatsapp',
        medium: 'channel',
        campaign: 'daily',
        term: 'tech',
        content: 'post1',
      });

      const parsed = new URL(result);
      assert.equal(parsed.searchParams.get('utm_source'), 'whatsapp');
      assert.equal(parsed.searchParams.get('utm_medium'), 'channel');
      assert.equal(parsed.searchParams.get('utm_campaign'), 'daily');
      assert.equal(parsed.searchParams.get('utm_term'), 'tech');
      assert.equal(parsed.searchParams.get('utm_content'), 'post1');
    });

    it('preserves existing query parameters', () => {
      const result = addUtm('https://example.com/news?id=42&category=tech', {
        source: 'whatsapp',
      });

      const parsed = new URL(result);
      assert.equal(parsed.searchParams.get('id'), '42');
      assert.equal(parsed.searchParams.get('category'), 'tech');
      assert.equal(parsed.searchParams.get('utm_source'), 'whatsapp');
    });

    it('skips undefined and null UTM values', () => {
      const result = addUtm('https://example.com/news', {
        source: 'whatsapp',
        medium: undefined,
        campaign: null,
      });

      const parsed = new URL(result);
      assert.equal(parsed.searchParams.get('utm_source'), 'whatsapp');
      assert.equal(parsed.searchParams.has('utm_medium'), false);
      assert.equal(parsed.searchParams.has('utm_campaign'), false);
    });

    it('throws on invalid URL', () => {
      assert.throws(() => addUtm('not-a-valid-url'), WhapiValidationError);
    });
  });

  describe('formatArticlePost', () => {
    it('formats TITLE + DESCRIPTION + URL separated by double newlines', () => {
      const post = formatArticlePost({
        title: 'Title',
        description: 'Description',
        url: 'https://example.com',
      });

      assert.equal(post, 'Title\n\nDescription\n\nhttps://example.com');
    });

    it('omits blank fields without leaving duplicate blank lines', () => {
      const post = formatArticlePost({
        title: 'Title Only',
      });
      assert.equal(post, 'Title Only');

      const postNoDesc = formatArticlePost({
        title: 'Title',
        url: 'https://example.com',
      });
      assert.equal(postNoDesc, 'Title\n\nhttps://example.com');
    });

    it('truncates description when maxDescriptionLength is specified', () => {
      const post = formatArticlePost({
        title: 'Title',
        description: 'A very long description that should be truncated safely at word boundaries',
        url: 'https://example.com',
        formatting: {
          maxDescriptionLength: 30,
        },
      });

      assert.ok(post.includes('...'));
      assert.ok(post.startsWith('Title\n\n'));
      assert.ok(post.endsWith('\n\nhttps://example.com'));
    });
  });
});
