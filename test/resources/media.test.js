import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MediaResource } from '../../src/resources/MediaResource.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('resources/MediaResource', () => {
  let captured;
  const mockHttp = {
    request: async (p) => {
      captured = p;
      return { id: 'media-xyz', size: 1024 };
    },
  };
  const media = new MediaResource(mockHttp);

  it('upload() sends binary body and custom Content-Type', async () => {
    const buf = Buffer.from('image content');
    const result = await media.upload(buf, { mimeType: 'image/jpeg' });

    assert.equal(captured.method, 'POST');
    assert.equal(captured.path, '/media');
    assert.equal(captured.headers['Content-Type'], 'image/jpeg');
    assert.equal(result.id, 'media-xyz');
  });

  it('upload() throws if fileOrBuffer is missing', async () => {
    await assert.rejects(() => media.upload(null), WhapiValidationError);
  });

  it('get() retrieves media metadata by ID', async () => {
    await media.get('media-xyz');
    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/media/media-xyz');
  });

  it('list() retrieves media files with query params', async () => {
    await media.list({ count: 10, offset: 0 });
    assert.equal(captured.method, 'GET');
    assert.equal(captured.path, '/media');
    assert.deepEqual(captured.query, { count: 10, offset: 0 });
  });
});
