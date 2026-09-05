import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertNonEmptyString,
  assertObject,
  assertArray,
  assertPositiveNumber,
  assertHttpUrl,
} from '../../src/core/validation.js';
import { WhapiValidationError } from '../../src/core/errors.js';

describe('core/validation', () => {
  it('assertNonEmptyString accepts valid strings', () => {
    assert.equal(assertNonEmptyString('hello', 'field'), 'hello');
    assert.equal(assertNonEmptyString('  test  ', 'field'), 'test');
  });

  it('assertNonEmptyString throws on empty or non-strings', () => {
    assert.throws(() => assertNonEmptyString('', 'field'), WhapiValidationError);
    assert.throws(() => assertNonEmptyString('   ', 'field'), WhapiValidationError);
    assert.throws(() => assertNonEmptyString(null, 'field'), WhapiValidationError);
    assert.throws(() => assertNonEmptyString(123, 'field'), WhapiValidationError);
  });

  it('assertObject accepts plain objects', () => {
    const obj = { a: 1 };
    assert.equal(assertObject(obj, 'options'), obj);
  });

  it('assertObject throws on arrays or primitives', () => {
    assert.throws(() => assertObject([], 'options'), WhapiValidationError);
    assert.throws(() => assertObject(null, 'options'), WhapiValidationError);
    assert.throws(() => assertObject('string', 'options'), WhapiValidationError);
  });

  it('assertArray validates array and minimum items', () => {
    assert.deepEqual(assertArray([1, 2], 'list', 1), [1, 2]);
    assert.throws(() => assertArray([1], 'list', 2), WhapiValidationError);
    assert.throws(() => assertArray('not-array', 'list'), WhapiValidationError);
  });

  it('assertPositiveNumber validates positive numbers', () => {
    assert.equal(assertPositiveNumber(10, 'timeout'), 10);
    assert.throws(() => assertPositiveNumber(0, 'timeout'), WhapiValidationError);
    assert.throws(() => assertPositiveNumber(-5, 'timeout'), WhapiValidationError);
    assert.throws(() => assertPositiveNumber('10', 'timeout'), WhapiValidationError);
    assert.throws(() => assertPositiveNumber(NaN, 'timeout'), WhapiValidationError);
  });

  it('assertHttpUrl validates http and https URLs', () => {
    assert.equal(assertHttpUrl('https://example.com/path', 'url'), 'https://example.com/path');
    assert.equal(assertHttpUrl('http://localhost:8000', 'url'), 'http://localhost:8000');
    assert.throws(() => assertHttpUrl('ftp://example.com', 'url'), WhapiValidationError);
    assert.throws(() => assertHttpUrl('not-a-url', 'url'), WhapiValidationError);
  });
});
