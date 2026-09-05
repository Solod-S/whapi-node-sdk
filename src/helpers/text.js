import { assertHttpUrl } from '../core/validation.js';

/**
 * Safely truncates text without splitting Unicode surrogate pairs,
 * with optional word-boundary snapping.
 *
 * @param {string} text - Input text
 * @param {number} maxLength - Maximum desired character length (in code points)
 * @param {object} [options]
 * @param {boolean} [options.wordBoundary=true] - Snap to nearest word boundary
 * @param {string} [options.ellipsis='...'] - Truncation indicator
 * @returns {string}
 */
export function truncateText(text, maxLength, options = {}) {
  if (typeof text !== 'string' || !text) {
    return '';
  }

  if (typeof maxLength !== 'number' || maxLength <= 0) {
    return text;
  }

  const { wordBoundary = true, ellipsis = '...' } = options;

  // Split safely by Unicode code points (handles emoji, accents, surrogate pairs)
  const codePoints = Array.from(text);

  if (codePoints.length <= maxLength) {
    return text;
  }

  const ellipsisCodePoints = Array.from(ellipsis);
  const targetLength = Math.max(1, maxLength - ellipsisCodePoints.length);

  let slice = codePoints.slice(0, targetLength).join('');

  if (wordBoundary) {
    // Look for the last space/punctuation in the truncated text
    const lastSpaceIndex = slice.search(/\s+[^\s]*$/);
    if (lastSpaceIndex > Math.floor(targetLength * 0.4)) {
      slice = slice.slice(0, lastSpaceIndex).trimEnd();
    }
  }

  return `${slice}${ellipsis}`;
}

/**
 * Safely appends UTM parameters to a URL while preserving existing query parameters.
 *
 * @param {string|URL} rawUrl - Target URL
 * @param {object} [utm] - UTM parameters object
 * @param {string} [utm.source] - utm_source
 * @param {string} [utm.medium] - utm_medium
 * @param {string} [utm.campaign] - utm_campaign
 * @param {string} [utm.term] - utm_term
 * @param {string} [utm.content] - utm_content
 * @returns {string} - Formatted URL string
 */
export function addUtm(rawUrl, utm = {}) {
  const urlString = rawUrl instanceof URL ? rawUrl.toString() : rawUrl;
  assertHttpUrl(urlString, 'url');

  const parsed = new URL(urlString);

  if (!utm || typeof utm !== 'object') {
    return parsed.toString();
  }

  const standardParams = {
    source: 'utm_source',
    medium: 'utm_medium',
    campaign: 'utm_campaign',
    term: 'utm_term',
    content: 'utm_content',
  };

  for (const [key, val] of Object.entries(utm)) {
    if (val !== undefined && val !== null && val !== '') {
      const paramName = standardParams[key] || (key.startsWith('utm_') ? key : `utm_${key}`);
      parsed.searchParams.set(paramName, String(val));
    }
  }

  return parsed.toString();
}

/**
 * Formats an article into a clean WhatsApp message text.
 *
 * Standard format:
 * TITLE
 *
 * DESCRIPTION
 *
 * URL
 *
 * @param {object} params
 * @param {string} params.title - Article title
 * @param {string} [params.description] - Article excerpt or body
 * @param {string} [params.url] - Link URL
 * @param {object} [params.formatting]
 * @param {boolean} [params.formatting.includeTitle=true]
 * @param {boolean} [params.formatting.includeDescription=true]
 * @param {boolean} [params.formatting.includeUrl=true]
 * @param {number} [params.formatting.maxDescriptionLength] - Max description length
 * @returns {string}
 */
export function formatArticlePost({ title, description, url, formatting = {} }) {
  const {
    includeTitle = true,
    includeDescription = true,
    includeUrl = true,
    maxDescriptionLength,
  } = formatting;

  const parts = [];

  if (includeTitle && title && typeof title === 'string') {
    const cleanTitle = title.trim();
    if (cleanTitle) {
      parts.push(cleanTitle);
    }
  }

  if (includeDescription && description && typeof description === 'string') {
    let cleanDesc = description.trim();
    if (cleanDesc) {
      if (maxDescriptionLength && maxDescriptionLength > 0) {
        cleanDesc = truncateText(cleanDesc, maxDescriptionLength);
      }
      parts.push(cleanDesc);
    }
  }

  if (includeUrl && url && typeof url === 'string') {
    const cleanUrl = url.trim();
    if (cleanUrl) {
      parts.push(cleanUrl);
    }
  }

  return parts.join('\n\n');
}
