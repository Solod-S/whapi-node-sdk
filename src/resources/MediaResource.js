import { assertNonEmptyString } from '../core/validation.js';
import { WhapiValidationError } from '../core/errors.js';

/**
 * Resource for uploading and managing media files in Whapi.Cloud storage.
 */
export class MediaResource {
  /**
   * @param {import('../core/HttpClient.js').HttpClient} http
   */
  constructor(http) {
    this.http = http;
  }

  /**
   * Uploads a media file (Buffer, Uint8Array, Blob, or FormData) to Whapi.Cloud cloud storage.
   *
   * @param {Buffer|Uint8Array|Blob|FormData|string} fileOrBuffer - File content or FormData
   * @param {object} [options]
   * @param {string} [options.mimeType] - MIME type (e.g. 'image/jpeg', 'application/pdf')
   * @param {string} [options.filename] - Optional filename
   * @param {AbortSignal} [options.signal]
   * @returns {Promise<{ id: string }>}
   */
  async upload(fileOrBuffer, options = {}) {
    if (!fileOrBuffer) {
      throw new WhapiValidationError('File or buffer is required for upload', {
        field: 'fileOrBuffer',
        value: fileOrBuffer,
      });
    }

    const headers = {};
    if (options.mimeType) {
      headers['Content-Type'] = options.mimeType;
    }

    return this.http.request({
      method: 'POST',
      path: '/media',
      body: fileOrBuffer,
      headers,
      signal: options.signal,
    });
  }

  /**
   * Retrieves media file metadata or binary info by Media ID.
   *
   * @param {string} mediaId - Media ID
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async get(mediaId, options = {}) {
    const id = assertNonEmptyString(mediaId, 'mediaId');

    return this.http.request({
      method: 'GET',
      path: `/media/${encodeURIComponent(id)}`,
      signal: options.signal,
    });
  }

  /**
   * Retrieves a list of uploaded media files.
   *
   * @param {object} [query] - count, offset, time_from, time_to, sort
   * @param {object} [options]
   * @returns {Promise<object>}
   */
  async list(query = {}, options = {}) {
    return this.http.request({
      method: 'GET',
      path: '/media',
      query,
      signal: options.signal,
    });
  }
}
