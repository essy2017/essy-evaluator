/* global describe, it */
'use strict';

var assert            = require('assert');
var Evaluator         = require('../dist/bundle').Evaluator;
var EvaluateException = require('../dist/bundle').EvaluateException;
var Parser            = require('../dist/bundle').Parser;

var evaluator = new Evaluator();
var parser = new Parser();

describe('Evaluator', () => {

  describe('Basic recognition', () => {
    it('Should evaluate number', () => {
      assert.strictEqual(evaluator.evaluate(parser.parse('123')), 123);
      assert.strictEqual(evaluator.evaluate('123'), 123);
    });
    it('Should error on unrecognized symbol', () => {
      assert.throws(() => { evaluator.evaluate('bad_symbol'); }),
      EvaluateException // jshint ignore:line
    });
  });

  describe('Constants', () => {
    it('FALSE', () => { assert.strictEqual(evaluator.evaluate('FALSE'), 0); });
    it('TRUE', () => { assert.strictEqual(evaluator.evaluate('TRUE'), 1); });
    it('E', () => { assert.strictEqual(evaluator.evaluate('E'), Math.E); });
    it('LN2', () => { assert.strictEqual(evaluator.evaluate('LN2'), Math.log(2)); });
    it('LN10', () => { assert.strictEqual(evaluator.evaluate('LN10'), Math.log(10)); });
    it('PI', () => { assert.strictEqual(evaluator.evaluate('PI'), Math.PI); });
    it('SQRT1_2', () => { assert.strictEqual(evaluator.evaluate('SQRT1_2'), 1 / Math.sqrt(2)); });
    it('SQRT2', () => { assert.strictEqual(evaluator.evaluate('SQRT2'), Math.sqrt(2)); });
  });

  describe('Prefix operators', () => {
    it('!1', () => { assert.strictEqual(evaluator.evaluate('!1'), 0); });
    it('!0', () => { assert.strictEqual(evaluator.evaluate('!0'), 1); });
  });

  describe('Infix operators', () => {
    it('1 + 3', () => { assert.strictEqual(evaluator.evaluate('1 + 3'), 4); });
    it('3 - 1', () => { assert.strictEqual(evaluator.evaluate('3 - 1'), 2); });
    it('2 * 3', () => { assert.strictEqual(evaluator.evaluate('2 * 3'), 6); });
    it('1 / 4', () => { assert.strictEqual(evaluator.evaluate('1 / 4'), 1 / 4); });
    it('1 / 0', () => { assert.throws(() => { evaluator.evaluate('1 / 0'); }, EvaluateException )});  // jshint ignore:line
    it('3 ^ 2', () => { assert.strictEqual(evaluator.evaluate('3 ^ 2'), 9); });
    it('3 == 3', () => { assert.strictEqual(evaluator.evaluate('3 == 3'), 1); });
    it('1 == 3', () => { assert.strictEqual(evaluator.evaluate('1 == 3'), 0); });
    it('1 != 3', () => { assert.strictEqual(evaluator.evaluate('1 != 3'), 1); });
    it('1 != 1', () => { assert.strictEqual(evaluator.evaluate('1 != 1'), 0); });
    it('2 < 3', () => { assert.strictEqual(evaluator.evaluate('2 < 3'), 1); });
    it('3 < 2', () => { assert.strictEqual(evaluator.evaluate('3 < 2'), 0); });
    it('2 <= 2', () => { assert.strictEqual(evaluator.evaluate('2 <= 2'), 1); });
    it('3 <= 2', () => { assert.strictEqual(evaluator.evaluate('3 <= 2'), 0); });
    it('2 > 1', () => { assert.strictEqual(evaluator.evaluate('2 > 1'), 1); });
    it('2 > 2', () => { assert.strictEqual(evaluator.evaluate('2 > 2'), 0); });
    it('2 >= 1', () => { assert.strictEqual(evaluator.evaluate('2 >= 1'), 1); });
    it('2 >= 3', () => { assert.strictEqual(evaluator.evaluate('2 >= 3'), 0); });
    it('2 ? 1 : 3', () => { assert.strictEqual(evaluator.evaluate('2 ? 1 : 3'), 1); });
    it('0 ? 1 : 3', () => { assert.strictEqual(evaluator.evaluate('0 ? 1 : 3'), 3); });
    it('1 && 2', () => { assert.strictEqual(evaluator.evaluate('1 && 2'), 1); });
    it('1 && 0', () => { assert.strictEqual(evaluator.evaluate('1 && 0'), 0); });
    it('0 && 5', () => { assert.strictEqual(evaluator.evaluate('0 && 5'), 0); });
    it('1 || 0', () => { assert.strictEqual(evaluator.evaluate('1 || 0'), 1); });
    it('0 || 0', () => { assert.strictEqual(evaluator.evaluate('0 || 0'), 0); });
  });

  describe('Functions', () => {
    it('rand()', () => {
      var value = evaluator.evaluate('rand()');
      assert.ok(value >= 0);
      assert.ok(value <= 1);
    });
    it('abs()', () => {
      assert.strictEqual(evaluator.evaluate('abs(2)'), 2);
      assert.strictEqual(evaluator.evaluate('abs(-2)'), 2);
    });
    it('acos()', () => {
      assert.strictEqual(evaluator.evaluate('acos(0.5)'), Math.acos(0.5));
      assert.throws(() => { evaluator.evaluate('acos(1.5)'); }, EvaluateException);
    });
    it('and()', () => {
      assert.strictEqual(evaluator.evaluate('and(1,2,3)'), 1);
      assert.strictEqual(evaluator.evaluate('and(1,-2,3)'), 0);
    });
    it('asin()', () => {
      assert.strictEqual(evaluator.evaluate('asin(0.5)'), Math.asin(0.5));
      assert.throws(() => { evaluator.evaluate('asin(1.5)'); }, EvaluateException);
    });
    it('atan()', () => {
      assert.strictEqual(evaluator.evaluate('atan(0.5)'), Math.atan(0.5));
      assert.throws(() => { evaluator.evaluate('atan(1.5)'); }, EvaluateException);
    });
    it('ceiling()', () => {
      assert.strictEqual(evaluator.evaluate('ceiling(9.3)'), 10);
    });
    it('choose()', () => {
      assert.strictEqual(evaluator.evaluate('choose(1,2,3)'), 2);
      assert.throws(() => { evaluator.evaluate('choose(0,1,2)'); }, EvaluateException);
      assert.throws(() => { evaluator.evaluate('choose(9,1,2)'); }, EvaluateException);
    });
    it('cos()', () => {
      assert.strictEqual(evaluator.evaluate('cos(10)'), Math.cos(10));
    });
    it('exp()', () => {
      assert.strictEqual(evaluator.evaluate('exp(4)'), Math.exp(4));
    });
    it('floor()', () => {
      assert.strictEqual(evaluator.evaluate('floor(9.3)'), 9);
    });
    it('if()', () => {
      assert.strictEqual(evaluator.evaluate('if(1,2,3)'), 2);
      assert.strictEqual(evaluator.evaluate('if(0,2,3)'), 3);
    });
    it('log()', () => {
      assert.strictEqual(evaluator.evaluate('log(3)'), Math.log(10) / Math.log(3));
      assert.throws(() => { evaluator.evaluate('log(-1.5)'); }, EvaluateException);
    });
    it('ln()', () => {
      assert.strictEqual(evaluator.evaluate('ln(3)'), Math.log(3));
      assert.throws(() => { evaluator.evaluate('ln(-1.5)'); }, EvaluateException);
    });
    it('max()', () => {
      assert.strictEqual(evaluator.evaluate('max(1,21,3)'), 21);
    });
    it('mean()', () => {
      assert.strictEqual(evaluator.evaluate('mean(1,2,3)'), 2);
    });
    it('median()', () => {
      assert.strictEqual(evaluator.evaluate('median(1, 2, 3)'), 2);
      assert.strictEqual(evaluator.evaluate('median(1, 2, 3, 4)'), 2.5);
    });
    it('min()', () => {
      assert.strictEqual(evaluator.evaluate('min(11,2,3)'), 2);
    });
    it('mod()', () => {
      assert.strictEqual(evaluator.evaluate('mod(5,2)'), 5 % 2);
      assert.throws(() => { evaluator.evaluate('mod(5,0)'); }, EvaluateException);
    });
    it('not()', () => {
      assert.strictEqual(evaluator.evaluate('not(3)'), 0);
      assert.strictEqual(evaluator.evaluate('not(-1)'), 1);
    });
    it('or()', () => {
      assert.strictEqual(evaluator.evaluate('or(1,0,3)'), 1);
      assert.strictEqual(evaluator.evaluate('or(-1,0,-3)'), 0);
    });
    it('pow()', () => {
      assert.strictEqual(evaluator.evaluate('pow(3,6)'), Math.pow(3, 6));
    });
    it('product()', () => {
      assert.strictEqual(evaluator.evaluate('product(1,2,3)'), 6);
    });
    it('quotient()', () => {
      assert.strictEqual(evaluator.evaluate('quotient(4,3)'), Math.floor(4 / 3));
      assert.throws(() => { evaluator.evaluate('quotient(4,0)'); }, EvaluateException);
    });
    it('randInt()', () => {
      var value = evaluator.evaluate('randInt(1, 4)');
      assert.ok(value >= 1);
      assert.ok(value <= 4);
      assert.strictEqual(value, Math.floor(value));
    });
    it('randRange()', () => {
      var value = evaluator.evaluate('randRange(1, 4)');
      assert.ok(value >= 1);
      assert.ok(value <= 4);
    });
    it('round()', () => {
      assert.strictEqual(evaluator.evaluate('round(9.3)'), Math.round(9.3));
    });
    it('sin()', () => {
      assert.strictEqual(evaluator.evaluate('sin(9)'), Math.sin(9));
    });
    it('sqrt()', () => {
      assert.strictEqual(evaluator.evaluate('sqrt(3)'), Math.sqrt(3));
      assert.throws(() => { evaluator.evaluate('sqrt(-3)'); }, EvaluateException);
    });
    it('sum()', () => {
      assert.strictEqual(evaluator.evaluate('sum(1,2,3)'), 6);
    });
    it('tan()', () => {
      assert.strictEqual(evaluator.evaluate('tan(9)'), Math.tan(9));
    });

  });

  describe('Custom definitions', () => {
    it('Should add custom definition', () => {
      evaluator.defineName('myConstant', 100);
      assert.strictEqual(evaluator.evaluate('myConstant'), 100);
    });
    it('Should update custom definition', () => {
      evaluator.defineName('myConstant', 100);
      assert.strictEqual(evaluator.evaluate('myConstant'), 100);
      evaluator.defineName('myConstant', 1000);
      assert.strictEqual(evaluator.evaluate('myConstant'), 1000);
    });
    it('Should delete custom definition', () => {
      evaluator.defineName('myConstant', 10);
      assert.strictEqual(evaluator.evaluate('myConstant'), 10);
      evaluator.deleteSymbol('myConstant');
      assert.throws(() => { evaluator.evaluate('myConstant'); }, EvaluateException);
    });
    it('Should apply custom definitions in evaluate()', () => {
      assert.strictEqual(evaluator.evaluate('10 + myConstant', { myConstant: 100 }), 110);
    });
  });

  describe('Custom functions', () => {
    it('Should add custom function', () => {
      evaluator.defineFunction('myFunc', function () {
        return this.argValue(0) * this.argValue(1);
      });
      assert.strictEqual(evaluator.evaluate('myFunc(2, 3)'), 6);
    });
  });

  describe('Custom infix operators', () => {
    it('Should add custom infix operator', () => {
      evaluator.defineInfixOperator('#', 40, {
        ev: function () {
          return this.firstValue() + this.secondValue();
        }
      });
      parser.updateOperators({ '#': 1 });
      assert.strictEqual(evaluator.evaluate(parser.parse('2 # 3')), 5);
    });
  });

  describe('Custom prefix operators', () => {
    it('Should add custom prefix operator', () => {
      evaluator.definePrefixOperator('#', {
        ev: function () {
          return 10 * this.first.ev();
        }
      });
      parser.updateOperators({ '#': 1 });
      assert.strictEqual(evaluator.evaluate(parser.parse('#10')), 100);
    });
  });

});
