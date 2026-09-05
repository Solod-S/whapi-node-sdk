import { WhapiValidationError } from './errors.js';

const CHANNEL_SUFFIX = '@newsletter';
// Whapi/WhatsApp Channel IDs consist of digits or standard characters followed optionally by @newsletter
const RAW_CHANNEL_ID_REGEX = /^\d{10,31}$/;
const FULL_CHANNEL_ID_REGEX = /^\d{10,31}@newsletter$/;
// General WhatsApp recipient regex (phone number with optional @s.whatsapp.net, or @g.us, @newsletter, etc.)
const GENERAL_RECIPIENT_REGEX = /^[\d-]{9,31}(@[\w.]{1,})?$/;

/**
 * Checks whether a given string is already a valid full WhatsApp Channel ID with suffix.
 *
 * @param {unknown} id
 * @returns {boolean}
 */
export function isChannelId(id) {
  if (typeof id !== 'string') {
    return false;
  }
  return FULL_CHANNEL_ID_REGEX.test(id.trim());
}

/**
 * Normalizes a WhatsApp Channel / Newsletter ID to the full @newsletter format.
 *
 * Examples:
 *   normalizeChannelId('120363123456789') => '120363123456789@newsletter'
 *   normalizeChannelId('120363123456789@newsletter') => '120363123456789@newsletter'
 *
 * @param {unknown} id
 * @returns {string}
 * @throws {WhapiValidationError}
 */
export function normalizeChannelId(id) {
  if (id === null || id === undefined) {
    throw new WhapiValidationError('Channel ID is required and cannot be null or undefined', {
      field: 'channelId',
      value: id,
    });
  }

  if (typeof id !== 'string') {
    throw new WhapiValidationError(`Channel ID must be a string, received ${typeof id}`, {
      field: 'channelId',
      value: id,
    });
  }

  const trimmed = id.trim();

  if (!trimmed) {
    throw new WhapiValidationError('Channel ID cannot be empty', {
      field: 'channelId',
      value: id,
    });
  }

  if (trimmed.endsWith(CHANNEL_SUFFIX)) {
    if (!FULL_CHANNEL_ID_REGEX.test(trimmed)) {
      throw new WhapiValidationError(
        `Invalid WhatsApp Channel ID format: "${trimmed}". Expected digits followed by ${CHANNEL_SUFFIX}`,
        { field: 'channelId', value: trimmed },
      );
    }
    return trimmed;
  }

  if (RAW_CHANNEL_ID_REGEX.test(trimmed)) {
    return `${trimmed}${CHANNEL_SUFFIX}`;
  }

  throw new WhapiValidationError(
    `Invalid WhatsApp Channel ID: "${trimmed}". Channel IDs must be numeric or end with ${CHANNEL_SUFFIX}`,
    { field: 'channelId', value: trimmed },
  );
}

/**
 * Normalizes and validates a recipient identifier (phone number, chat ID, group ID, or channel ID).
 *
 * @param {unknown} to
 * @returns {string}
 * @throws {WhapiValidationError}
 */
export function normalizeRecipient(to) {
  if (to === null || to === undefined) {
    throw new WhapiValidationError('Recipient "to" is required and cannot be null or undefined', {
      field: 'to',
      value: to,
    });
  }

  if (typeof to !== 'string') {
    throw new WhapiValidationError(`Recipient "to" must be a string, received ${typeof to}`, {
      field: 'to',
      value: to,
    });
  }

  const trimmed = to.trim();

  if (!trimmed) {
    throw new WhapiValidationError('Recipient "to" cannot be empty', {
      field: 'to',
      value: to,
    });
  }

  // If it's a numeric channel ID without suffix, or standard recipient
  if (trimmed.endsWith(CHANNEL_SUFFIX)) {
    return normalizeChannelId(trimmed);
  }

  if (!GENERAL_RECIPIENT_REGEX.test(trimmed)) {
    throw new WhapiValidationError(
      `Invalid recipient format: "${trimmed}". Expected phone number or valid WhatsApp JID`,
      { field: 'to', value: trimmed },
    );
  }

  return trimmed;
}
