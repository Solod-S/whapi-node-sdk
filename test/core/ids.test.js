import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeChannelId, normalizeRecipient, isChannelId } from '../../src/core/ids.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('core/ids', () => {
  describe('normalizeChannelId', () => {
    it('appends @newsletter to a numeric string channel id', () => {
      assert.equal(normalizeChannelId('120363123456789'), '120363123456789@newsletter');
      assert.equal(normalizeChannelId('120363123456789012'), '120363123456789012@newsletter');
    });

    it('preserves an ID that already has @newsletter', () => {
      assert.equal(normalizeChannelId('120363123456789@newsletter'), '120363123456789@newsletter');
    });

    it('trims whitespace before normalizing', () => {
      assert.equal(normalizeChannelId('  120363123456789   '), '120363123456789@newsletter');
    });

    it('throws WhapiValidationError on null, undefined, or empty string', () => {
      assert.throws(() => normalizeChannelId(null), WhapiValidationError);
      assert.throws(() => normalizeChannelId(undefined), WhapiValidationError);
      assert.throws(() => normalizeChannelId(''), WhapiValidationError);
      assert.throws(() => normalizeChannelId('   '), WhapiValidationError);
    });

    it('throws WhapiValidationError on non-string inputs', () => {
      assert.throws(() => normalizeChannelId(123456789), WhapiValidationError);
      assert.throws(() => normalizeChannelId({}), WhapiValidationError);
    });

    it('throws WhapiValidationError on arbitrary invalid strings', () => {
      assert.throws(() => normalizeChannelId('invalid-channel-id'), WhapiValidationError);
      assert.throws(() => normalizeChannelId('abc@newsletter'), WhapiValidationError);
      assert.throws(() => normalizeChannelId('123'), WhapiValidationError); // too short
    });
  });

  describe('isChannelId', () => {
    it('returns true for valid full channel ids', () => {
      assert.equal(isChannelId('120363123456789@newsletter'), true);
    });

    it('returns false for incomplete or invalid ids', () => {
      assert.equal(isChannelId('120363123456789'), false);
      assert.equal(isChannelId(''), false);
      assert.equal(isChannelId(null), false);
    });
  });

  describe('normalizeRecipient', () => {
    it('accepts phone numbers and chat ids', () => {
      assert.equal(normalizeRecipient('12345678901'), '12345678901');
      assert.equal(normalizeRecipient('12345678901@s.whatsapp.net'), '12345678901@s.whatsapp.net');
      assert.equal(normalizeRecipient('120363123456789@g.us'), '120363123456789@g.us');
    });

    it('accepts channel ids', () => {
      assert.equal(normalizeRecipient('120363123456789@newsletter'), '120363123456789@newsletter');
    });

    it('throws on empty or null values', () => {
      assert.throws(() => normalizeRecipient(null), WhapiValidationError);
      assert.throws(() => normalizeRecipient(''), WhapiValidationError);
      assert.throws(() => normalizeRecipient('short'), WhapiValidationError);
    });
  });
});
