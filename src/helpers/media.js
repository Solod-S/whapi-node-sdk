import { WhapiValidationError } from '../core/errors.js';

/**
 * Normalizes a media input into a format suitable for the Whapi API payload.
 *
 * Supports:
 * - Direct URL strings ('https://...')
 * - Base64 data URIs ('data:image/...;base64,...')
 * - Raw Media IDs
 * - Buffer / Uint8Array (converts to base64 data URI if mimeType provided, or base64)
 * - Objects { source, media, url, caption, mime_type, no_encode, no_cache }
 *
 * @param {unknown} input - The media representation
 * @param {object} [defaultOptions] - Optional defaults like caption or mime_type
 * @returns {{ media: string, caption?: string, [key: string]: unknown }}
 */
export function normalizeMediaInput(input, defaultOptions = {}) {
  if (input === null || input === undefined) {
    throw new WhapiValidationError('Media input is required', {
      field: 'media',
      value: input,
    });
  }

  // If input is already a string (URL, base64, or media ID)
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new WhapiValidationError('Media string cannot be empty', {
        field: 'media',
        value: input,
      });
    }

    return {
      media: trimmed,
      ...defaultOptions,
    };
  }

  // If input is a Buffer or Uint8Array
  if (input instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(input))) {
    const mimeType =
      defaultOptions.mime_type || defaultOptions.mimeType || 'application/octet-stream';
    const base64Data =
      typeof Buffer !== 'undefined'
        ? Buffer.from(input).toString('base64')
        : btoa(String.fromCharCode(...input));
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    return {
      media: dataUri,
      ...defaultOptions,
    };
  }

  // If input is an options/descriptor object
  if (typeof input === 'object') {
    const rawMedia = input.media || input.source || input.url || input.file;

    if (!rawMedia) {
      throw new WhapiValidationError(
        'Media object must include at least one of: "media", "source", or "url"',
        { field: 'media', value: input },
      );
    }

    const normalizedInner = normalizeMediaInput(rawMedia, {
      mime_type: input.mime_type || input.mimeType || defaultOptions.mime_type,
    });

    const caption = input.caption ?? defaultOptions.caption;
    const result = {
      ...defaultOptions,
      ...input,
      media: normalizedInner.media,
    };

    if (caption !== undefined) {
      result.caption = caption;
    }

    // Clean up internal aliases
    delete result.source;
    delete result.url;
    delete result.file;
    delete result.mimeType;

    return result;
  }

  throw new WhapiValidationError(
    `Unsupported media input type: ${typeof input}. Expected string, Buffer, Uint8Array, or object`,
    { field: 'media', value: input },
  );
}
