var assert            = require('assert');
var evaluator         = require('../src/evaluator.js');
var EvaluateException = require('../src/evaluate-exception.js');
var Parser            = require('../src/parser.js');

var parser = new Parser();

// Numerical.
assert.strictEqual(
  evaluator.evaluate(parser.parse('123')),
  123,
  'Numerical evaluation failed.'
);

// Unrecognized symbol.
assert.throws(
  () => { evaluator.evaluate(parser.parse('unknown_symbol')); },
  EvaluateException,
  'No exception raised on unknown symbol.'
);


/*******************************************************************************
 *
 * CONSTANTS
 *
 ******************************************************************************/
assert.strictEqual(
  evaluator.evaluate(parser.parse('FALSE')),
  0,
  'FALSE constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('TRUE')),
  1,
  'TRUE constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('E')),
  Math.E,
  'E constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('LN2')),
  Math.log(2),
  'LN2 constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('LN10')),
  Math.log(10),
  'LN10 constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('PI')),
  Math.PI,
  'PI constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('SQRT1_2')),
  1 / Math.sqrt(2),
  'SQRT1_2 constant failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('SQRT2')),
  Math.sqrt(2),
  'SQRT2 constant failed.'
);


/*******************************************************************************
 *
 * PREFIX OPERATORS
 *
 ******************************************************************************/
assert.strictEqual(
  evaluator.evaluate(parser.parse('!1')),
  0,
  '! prefix operator failed.'
);


/*******************************************************************************
 *
 * INFIX OPERATORS
 *
 ******************************************************************************/
assert.strictEqual(
  evaluator.evaluate(parser.parse('1 + 3')),
  4,
  '+ infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('3 - 1')),
  2,
  '- infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 * 3')),
  6,
  '* infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('1 / 4')),
  1 / 4,
  '/ infix operator failed.'
);

assert.throws(
  () => { evaluator.evaluate(parser.parse('1 / 0')); },
  EvaluateException,
  'Divide by zero failed to throw exception.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('3^2')),
  9,
  '^ infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('3 == 3')),
  1,
  '== infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('1 == 3')),
  0,
  '== infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('1 != 3')),
  1,
  '!= infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('1 != 1')),
  0,
  '!= infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 < 3')),
  1,
  '< infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('3 < 2')),
  0,
  '< infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 <= 2')),
  1,
  '<= infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('3 <= 2')),
  0,
  '<= infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 > 1')),
  1,
  '> infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('2 > 2')),
  0,
  '> infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 >= 1')),
  1,
  '>= infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('2 >= 3')),
  0,
  '>= infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('2 ? 1 : 3')),
  1,
  '? : infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('0 ? 1 : 3')),
  3,
  '? : infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('1 && 2')),
  1,
  '&& infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('1 && 0')),
  0,
  '&& infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('0 && 5')),
  0,
  '&& infix operator failed.'
);

assert.strictEqual(
  evaluator.evaluate(parser.parse('1 || 0')),
  1,
  '|| infix operator failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('0 || 0')),
  0,
  '|| infix operator failed.'
);


/*******************************************************************************
 *
 * FUNCTIONS (Single or no argument)
 *
 ******************************************************************************/

// rand()
var value = evaluator.evaluate(parser.parse('rand()'));
assert.ok(value >= 0, 'rand() produced value less than 0.');
assert.ok(value <= 1, 'rand() produced value greater than 1.');

// abs()
assert.strictEqual(
  evaluator.evaluate(parser.parse('abs(2)')),
  2,
  'abs() failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('abs(-2)')),
  2,
  'abs() failed.'
);

// acos()
assert.strictEqual(
  evaluator.evaluate(parser.parse('acos(0.5)')),
  Math.acos(0.5),
  'acos() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('acos(1.5)')); },
  EvaluateException,
  'acos() failed to validate input range.'
);

// asin()
assert.strictEqual(
  evaluator.evaluate(parser.parse('asin(0.5)')),
  Math.asin(0.5),
  'asin() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('asin(1.5)')); },
  EvaluateException,
  'asin() failed to validate input range.'
);

// atan()
assert.strictEqual(
  evaluator.evaluate(parser.parse('atan(0.5)')),
  Math.atan(0.5),
  'atan() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('atan(1.5)')); },
  EvaluateException,
  'atan() failed to validate input range.'
);

// ceiling()
assert.strictEqual(
  evaluator.evaluate(parser.parse('ceiling(9.3)')),
  10,
  'ceiling() failed.'
);

// cos()
assert.strictEqual(
  evaluator.evaluate(parser.parse('cos(10)')),
  Math.cos(10),
  'cos() failed.'
);

// exp()
assert.strictEqual(
  evaluator.evaluate(parser.parse('exp(4)')),
  Math.exp(4),
  'exp() failed.'
);

// floor()
assert.strictEqual(
  evaluator.evaluate(parser.parse('floor(9.3)')),
  9,
  'floor() failed.'
);

// log()
assert.strictEqual(
  evaluator.evaluate(parser.parse('log(3)')),
  Math.log(10) / Math.log(3),
  'log() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('log(-1)')); },
  EvaluateException,
  'log() failed to validate input range.'
);

// ln()
assert.strictEqual(
  evaluator.evaluate(parser.parse('ln(3)')),
  Math.log(3),
  'ln() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('ln(-3)')); },
  EvaluateException,
  'ln() failed to validate input range.'
);

// not()
assert.strictEqual(
  evaluator.evaluate(parser.parse('not(3)')),
  0,
  'not() failed.'
);

// round()
assert.strictEqual(
  evaluator.evaluate(parser.parse('round(9.3)')),
  Math.round(9.3),
  'round() failed.'
);

// sin()
assert.strictEqual(
  evaluator.evaluate(parser.parse('sin(9)')),
  Math.sin(9),
  'sin() failed.'
);

// sqrt()
assert.strictEqual(
  evaluator.evaluate(parser.parse('sqrt(9)')),
  Math.sqrt(9),
  'sqrt() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('sqrt(-3)')); },
  EvaluateException,
  'sqrt() failed to validate input range.'
);

// tan()
assert.strictEqual(
  evaluator.evaluate(parser.parse('tan(9)')),
  Math.tan(9),
  'tan() failed.'
);



/*******************************************************************************
 *
 * FUNCTIONS (multiple arguments)
 *
 ******************************************************************************/

// and()
assert.strictEqual(
  evaluator.evaluate(parser.parse('and(1,2,3)')),
  1,
  'and() failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('and(1,-2,3)')),
  0,
  'and() failed.'
);

// choose()
assert.strictEqual(
  evaluator.evaluate(parser.parse('choose(1,2,3)')),
  2,
  'choose() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('choose(0,1,2)')); },
  EvaluateException,
  'choose() failed to validate inputs.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('choose(9,1,2)')); },
  EvaluateException,
  'choose() failed to validate inputs.'
);

// if()
assert.strictEqual(
  evaluator.evaluate(parser.parse('if(1,2,3)')),
  2,
  'if() failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('if(0,2,3)')),
  3,
  'if() failed.'
);

// max()
assert.strictEqual(
  evaluator.evaluate(parser.parse('max(1,21,3)')),
  21,
  'max() failed.'
);

// mean()
assert.strictEqual(
  evaluator.evaluate(parser.parse('mean(1,2,3)')),
  2,
  'mean() failed.'
);

// min()
assert.strictEqual(
  evaluator.evaluate(parser.parse('min(11,2,3)')),
  2,
  'min() failed.'
);

// modulo()
assert.strictEqual(
  evaluator.evaluate(parser.parse('mod(5,2)')),
  5 % 2,
  'mod() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('mod(5,0)')); },
  EvaluateException,
  'mod() failed to validate inputs.'
);

// or()
assert.strictEqual(
  evaluator.evaluate(parser.parse('or(1,2,3)')),
  1,
  'or() failed.'
);
assert.strictEqual(
  evaluator.evaluate(parser.parse('or(-1,0,-3)')),
  0,
  'or() failed.'
);

// pow()
assert.strictEqual(
  evaluator.evaluate(parser.parse('pow(3,6)')),
  Math.pow(3, 6),
  'pow() failed.'
);

// product()
assert.strictEqual(
  evaluator.evaluate(parser.parse('product(1,2,3)')),
  6,
  'product() failed.'
);

// quotient()
assert.strictEqual(
  evaluator.evaluate(parser.parse('quotient(4,3)')),
  Math.floor(4 / 3),
  'quotient() failed.'
);
assert.throws(
  () => { evaluator.evaluate(parser.parse('quotient(3, 0)')); },
  EvaluateException,
  'quotient() failed to validate inputs.'
);

// randInt()
var randInt = evaluator.evaluate(parser.parse('randInt(1,4)'));
assert.ok(randInt >= 1, 'randInt() returned value less than lower bound.');
assert.ok(randInt <= 4, 'randInt() returned value greater than upper bound.');
assert.strictEqual(randInt, Math.floor(randInt), 'randInt() failed.');

// randRange()
var randRange = evaluator.evaluate(parser.parse('randRange(1,4)'));
assert.ok(randRange >= 1, 'randRange() returned value less than lower bound.');
assert.ok(randRange <= 4, 'randRange() returned value greater than upper bound.');

// sum()
assert.strictEqual(
  evaluator.evaluate(parser.parse('sum(1,2,3)')),
  6,
  'sum() failed.'
);
