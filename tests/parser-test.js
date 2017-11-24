var Parser     = require('../src/parser.js');
var ParseError = require('../src/parse-error.js');
var assert     = require('assert');
var parser;

// Empty string should return empty array.
parser = new Parser();
assert.deepEqual(parser.parse(''), [], 'Empty string did not return empty array.');


/************************************************************************
 *
 * NAMES
 *
 ***********************************************************************/

// Single letter should return name.
assert.deepEqual(
  parser.parse('a'),
  [{ type: 'name', value: 'a' }],
  'Single letter did not return name token.'
)

// Multiple letters should return name.
assert.deepEqual(
  parser.parse('abcd'),
  [{ type: 'name', value: 'abcd' }],
  'Multiple letters did not return name token.'
);


/************************************************************************
 *
 * STRINGS
 *
 ***********************************************************************/

// Single string should return string.
assert.deepEqual(
  parser.parse('"a"'),
  [{ type: 'string', value: 'a' }],
  'Single string did not return value.'
);


/************************************************************************
 *
 * NUMBERS
 *
 ***********************************************************************/

// Single number should return number.
assert.deepEqual(
  parser.parse('1'),
  [{ type: 'number', value: 1 }],
  'Single number did not return number token.'
);

// Larger number should return number.
assert.deepEqual(
  parser.parse('100'),
  [{ type: 'number', value: 100 }],
  'Larger number did not return number token.'
);

// Decimal number should return number.
assert.deepEqual(
  parser.parse('1.23'),
  [{ type: 'number', value: 1.23 }],
  'Decimal number did not return number token.'
);

// Exponential number should return number.
assert.deepEqual(
  parser.parse('1e10'),
  [{ type: 'number', value: 1e10 }],
  'Exponential did not return number token.'
);

/************************************************************************
 *
 * OPERATORS
 *
 ***********************************************************************/

// Inline operators.
assert.deepEqual(
  parser.parse('1 + 2'),
  [
    { type: 'number', value: 1 },
    { type: 'operator', value: '+' },
    { type: 'number', value: 2 }
  ],
  'Inline operator failed.'
);

// Multiple-character inline operators.
assert.deepEqual(
  parser.parse('1 <= 2'),
  [
    { type: 'number', value: 1 },
    { type: 'operator', value: '<=' },
    { type: 'number', value: 2 }
  ],
  'Multiple-character inline operator failed.'
);

// Prefix operators.
assert.deepEqual(
  parser.parse('!2'),
  [
    { type: 'operator', value: '!' },
    { type: 'number', value: 2 }
  ],
  'Prefix operator failed.'
);

// Function.
assert.deepEqual(
  parser.parse('min(1, 2)'),
  [
    { type: 'name', value: 'min' },
    { type: 'operator', value: '(' },
    { type: 'number', value: 1 },
    { type: 'operator', value: ',' },
    { type: 'number', value: 2 },
    { type: 'operator', value: ')' }
  ],
  'Function failed.'
);

// Override defaults.
parser = new Parser({ '+': 0 });
assert.throws(
  () => { parser.parse('1 + 2'); },
  ParseError,
  'Overriding default operators failed.'
);
parser.updateOperators({ '+': 1 });

// Add custom operators.
parser = new Parser({ '$': 1 });
assert.deepEqual(
  parser.parse('1 $ 5'),
  [
    { type: 'number', value: 1 },
    { type: 'operator', value: '$' },
    { type: 'number', value: 5 }
  ],
  'Custom operator was not added.'
);
parser.updateOperators({ '$': 0 });

/************************************************************************
 *
 * ERRORS
 *
 ***********************************************************************/

// Invalid exponent.
assert.throws(
  () => { parser.parse('1eA'); },
  ParseError,
  'Invalid exponent did not throw error.'
);

// Invalid number.
assert.throws(
  () => { parser.parse('123a'); },
  ParseError,
  'Invalid number did not throw error.'
);

// Unterminated string.
assert.throws(
  () => { parser.parse('"Bad'); },
  ParseError,
  'Unterminated string did not throw error.'
);

// Trailing operator.
assert.throws(
  () => { parser.parse('1 +'); },
  ParseError,
  'Trailing operator did not throw error.'
);

// Trailing parentheses okay.
assert.deepEqual(
  parser.parse('(1)'),
  [
    { type: 'operator', value: '(' },
    { type: 'number', value: 1 },
    { type: 'operator', value: ')' }
  ],
  'Trailing parentheses failed.'
);
