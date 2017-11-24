/* global describe, it */
'use strict';

var Parser = require('../dist/bundle').Parser;
var ParseException = require('../dist/bundle').ParseException;
//var Parser         = require('../src/parser.js');
//var ParseException = require('../src/parse-exception.js');
var assert         = require('assert');
var parser         = new Parser();

/**
 * Creates single token.
 * @method token
 * @param type {String} "operator", "name", "number", or "string".
 * @param value {Any} Token value.
 * @return {Object[]} Single token in array.
 */
function token (type, value) {
  return [{ type: type, value: value }];
}

describe('Parser', () => {

  it('Should return empty array', () => {
    assert.deepEqual(parser.parse(''), []);
  });

  describe('Names', () => {
    it('Should create name token from single letter', () => {
      assert.deepEqual(parser.parse('a'), token('name', 'a'));
    });
    it('Should create name token from multiple letters', () => {
      assert.deepEqual(parser.parse('abcd'), token('name', 'abcd'));
    });
  });

  describe('Strings', () => {
    it('Should create string token', () => {
      assert.deepEqual(parser.parse('"a"'), token('string', 'a'));
    });
    it('Should fail on unterminated string', () => {
      assert.throws(
        () => { parser.parse('"abc'); },
        ParseException
      );
    });
  });

  describe('Numbers', () => {
    it('Should create number tokens from decimals', () => {
      assert.deepEqual(parser.parse('1'), token('number', 1));
      assert.deepEqual(parser.parse('100'), token('number', 100));
      assert.deepEqual(parser.parse('1.23'), token('number', 1.23));
      assert.deepEqual(parser.parse('1.'), token('number', 1));
    });
    it('Should create number tokens from scientific notiation', () => {
      assert.deepEqual(parser.parse('1e10'), token('number', 1e10));
      assert.deepEqual(parser.parse('1e+10'), token('number', 1e10));
      assert.deepEqual(parser.parse('1E10'), token('number', 1e10));
      assert.deepEqual(parser.parse('1e-10'), token('number', 1e-10));
    });
    it('Should error on bad numbers', () => {
      assert.throws(() => { parser.parse('1..'); }, ParseException);
      assert.throws(() => { parser.parse('1a'); }, ParseException);
    });
  });

  describe('Operators', () => {
    it('Should recognize inline operator', () => {
      assert.deepEqual(
        parser.parse('1 + 2'),
        [
          { type: 'number', value: 1 },
          { type: 'operator', value: '+' },
          { type: 'number', value: 2 }
        ]
      );
      assert.deepEqual(
        parser.parse('1 <= 2'),
        [
          { type: 'number', value: 1 },
          { type: 'operator', value: '<=' },
          { type: 'number', value: 2 }
        ]
      );
    });
    it('Should recognize prefix operator', () => {
      assert.deepEqual(
        parser.parse('!2'),
        [
          { type: 'operator', value: '!' },
          { type: 'number', value: 2 }
        ]
      );
    });
    it('Should recognize function-related operators', () => {
      assert.deepEqual(
        parser.parse('min(1, 2)'),
        [
          { type: 'name', value: 'min' },
          { type: 'operator', value: '(' },
          { type: 'number', value: 1 },
          { type: 'operator', value: ',' },
          { type: 'number', value: 2 },
          { type: 'operator', value: ')' }
        ]
      );
    });
    it('Should error on trailing operator', () => {
      assert.throws(() => { parser.parse('1 +'); }, ParseException);
      assert.deepEqual(
        parser.parse('(1)'),
        [
          { type: 'operator', value: '(' },
          { type: 'number', value: 1 },
          { type: 'operator', value: ')' }
        ]
      );
    });
  });

  describe('Operator overrides', () => {
    it('Should override default', () => {
      parser = new Parser({ '+': 0 });
      assert.throws(
        () => { parser.parse('1 + 2'); },
        ParseException
      );
      parser.updateOperators({ '+': 1 });
      assert.deepEqual(
        parser.parse('1 + 2'),
        [
          { type: 'number', value: 1 },
          { type: 'operator', value: '+' },
          { type: 'number', value: 2 }
        ]
      );
    });
    it('Should recognize custom', () => {
      parser = new Parser({ '$': 1 });
      assert.deepEqual(
        parser.parse('4 $ 5'),
        [
          { type: 'number', value: 4 },
          { type: 'operator', value: '$' },
          { type: 'number', value: 5 }
        ]
      );
    });
  });

});
