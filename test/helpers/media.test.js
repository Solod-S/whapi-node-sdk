import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeMediaInput } from '../../src/helpers/media.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('helpers/media', () => {
  it('normalizes URL string', () => {
    const res = normalizeMediaInput('https://example.com/img.jpg', { caption: 'Nice' });
    assert.equal(res.media, 'https://example.com/img.jpg');
    assert.equal(res.caption, 'Nice');
  });

  it('normalizes Buffer into base64 data URI', () => {
    const buf = Buffer.from('hello buffer');
    const res = normalizeMediaInput(buf, { mime_type: 'image/png' });

    assert.ok(res.media.startsWith('data:image/png;base64,'));
  });

  it('normalizes descriptor object with source or url', () => {
    const res = normalizeMediaInput({
      source: 'https://example.com/flower.jpg',
      caption: 'Flower caption',
    });

    assert.equal(res.media, 'https://example.com/flower.jpg');
    assert.equal(res.caption, 'Flower caption');
    assert.equal(res.source, undefined);
  });

  it('throws on empty or invalid media inputs', () => {
    assert.throws(() => normalizeMediaInput(null), WhapiValidationError);
    assert.throws(() => normalizeMediaInput(''), WhapiValidationError);
    assert.throws(() => normalizeMediaInput({}), WhapiValidationError);
    assert.throws(() => normalizeMediaInput(12345), WhapiValidationError);
  });
});
