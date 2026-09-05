import { WhapiValidationError } from './errors.js';

/**
 * Asserts that a value is a non-empty string.
 *
 * @param {unknown} value
 * @param {string} field
 * @returns {string}
 * @throws {WhapiValidationError}
 */
export function assertNonEmptyString(value, field) {
  if (value === null || value === undefined) {
    throw new WhapiValidationError(`"${field}" is required`, { field, value });
  }
  if (typeof value !== 'string') {
    throw new WhapiValidationError(`"${field}" must be a string, received ${typeof value}`, {
      field,
      value,
    });
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new WhapiValidationError(`"${field}" cannot be empty`, { field, value });
  }
  return trimmed;
}

/**
 * Asserts that a value is a plain object or options object.
 *
 * @param {unknown} value
 * @param {string} field
 * @returns {object}
 * @throws {WhapiValidationError}
 */
export function assertObject(value, field) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new WhapiValidationError(`"${field}" must be an object`, { field, value });
  }
  return value;
}

/**
 * Asserts that a value is a valid array, optionally checking min items.
 *
 * @param {unknown} value
 * @param {string} field
 * @param {number} [minItems=0]
 * @returns {Array}
 * @throws {WhapiValidationError}
 */
export function assertArray(value, field, minItems = 0) {
  if (!Array.isArray(value)) {
    throw new WhapiValidationError(`"${field}" must be an array`, { field, value });
  }
  if (value.length < minItems) {
    throw new WhapiValidationError(`"${field}" must contain at least ${minItems} item(s)`, {
      field,
      value,
    });
  }
  return value;
}

/**
 * Asserts that a value is a positive number.
 *
 * @param {unknown} value
 * @param {string} field
 * @returns {number}
 * @throws {WhapiValidationError}
 */
export function assertPositiveNumber(value, field) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new WhapiValidationError(`"${field}" must be a positive number`, { field, value });
  }
  return value;
}

/**
 * Asserts that a URL is a valid http/https string.
 *
 * @param {unknown} value
 * @param {string} field
 * @returns {string}
 * @throws {WhapiValidationError}
 */
export function assertHttpUrl(value, field) {
  const str = assertNonEmptyString(value, field);
  try {
    const parsed = new URL(str);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Invalid protocol');
    }
    return str;
  } catch (_e) {
    throw new WhapiValidationError(
      `"${field}" must be a valid HTTP or HTTPS URL, received "${str}"`,
      { field, value: str },
    );
  }
}
