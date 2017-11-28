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
      assert.strictEqual(evaluator.evaluate('and([1,2,3])'), 1);
      assert.strictEqual(evaluator.evaluate('and([1,2,-3])'), 0);
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
    it('fac()', () => {
      assert.strictEqual(evaluator.evaluate('fac(4)'), 24);
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
      assert.strictEqual(evaluator.evaluate('max([1,21,3])'), 21);
    });
    it('mean()', () => {
      assert.strictEqual(evaluator.evaluate('mean(1,2,3)'), 2);
      assert.strictEqual(evaluator.evaluate('mean([1,2,3])'), 2);
    });
    it('median()', () => {
      assert.strictEqual(evaluator.evaluate('median(1, 2, 3)'), 2);
      assert.strictEqual(evaluator.evaluate('median(1, 2, 3, 4)'), 2.5);
      assert.strictEqual(evaluator.evaluate('median([1, 2, 3])'), 2);
      assert.strictEqual(evaluator.evaluate('median([1, 2, 3, 4])'), 2.5);
    });
    it('min()', () => {
      assert.strictEqual(evaluator.evaluate('min(11,2,3)'), 2);
      assert.strictEqual(evaluator.evaluate('min([11,2,3])'), 2);
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
      assert.strictEqual(evaluator.evaluate('or([1,0,3])'), 1);
      assert.strictEqual(evaluator.evaluate('or([-1,0,-3])'), 0);
    });
    it('pow()', () => {
      assert.strictEqual(evaluator.evaluate('pow(3,6)'), Math.pow(3, 6));
    });
    it('product()', () => {
      assert.strictEqual(evaluator.evaluate('product(1,2,3)'), 6);
      assert.strictEqual(evaluator.evaluate('product([1,2,3])'), 6);
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
      assert.strictEqual(evaluator.evaluate('sum([1,2,3])'), 6);
    });
    it('tan()', () => {
      assert.strictEqual(evaluator.evaluate('tan(9)'), Math.tan(9));
    });

  });

  describe('Array functions', () => {
    it('andA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].andA()'), 1);
      assert.strictEqual(evaluator.evaluate('[1,2,0].andA()'), 0);
    });
    it('everyA()', () => {
      evaluator.defineFunction('threshold', function (x) {
        return x < 10;
      });
      assert.strictEqual(evaluator.evaluate('[1,2,3].everyA("threshold")'), 1);
      assert.strictEqual(evaluator.evaluate('[1,2,11].everyA("threshold")'), 0);
    });
    it('filterA()', () => {
      evaluator.defineFunction('myFilter', function (x) {
        return x < 3;
      });
      assert.deepEqual(evaluator.evaluate('[1,2,4,5].filterA("myFilter")'), [1, 2]);
    });
    it('includesA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,4,5].includesA(2)'), 1);
      assert.strictEqual(evaluator.evaluate('[1,2,4,5].includesA(3)'), 0);
    });
    it('joinA()', () => {
      assert.strictEqual(evaluator.evaluate('["a", "b", "c"].joinA("_")'), 'a_b_c');
    });
    it('mapA()', () => {
      assert.deepEqual(evaluator.evaluate('[1,2,3].mapA("fac")'), [1, 2, 6]);
      assert.deepEqual(evaluator.evaluate('[1,2,1+2].mapA("fac")'), [1, 2, 6]);
    });
    it('maxA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,9,3].maxA()'), 9);
    });
    it('meanA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].meanA()'), 2);
    });
    it('medianA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].medianA()'), 2);
      assert.strictEqual(evaluator.evaluate('[1, 2, 3, 4].medianA()'), 2.5);
    });
    it('minA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,9,3].minA()'), 1);
    });
    it('orA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].orA()'), 1);
      assert.strictEqual(evaluator.evaluate('[-1,-2,0].orA()'), 0);
    });
    it('productA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].productA()'), 6);
    });
    it('reduceA()', () => {
      evaluator.defineFunction('reducer', function (acc, cur) {
        return acc + cur;
      });
      assert.strictEqual(evaluator.evaluate('[0,1,2,3].reduceA("reducer")'), 6);
      assert.strictEqual(evaluator.evaluate('[1,2,3].reduceA("reducer", 0)'), 6);
    });
    it('reverseA()', () => {
      assert.deepEqual(evaluator.evaluate('[1,2,3].reverseA()'), [3, 2, 1]);
    });
    it('sliceA()', () => {
      assert.deepEqual(evaluator.evaluate('[1,2,3,4].sliceA(1,3)'), [2, 3]);
    });
    it('someA()', () => {
      evaluator.defineFunction('checkSome', function (x) {
        return x === 5;
      });
      assert.strictEqual(evaluator.evaluate('[0,1,5].someA("checkSome")'), 1);
      assert.strictEqual(evaluator.evaluate('[0,1,2].someA("checkSome")'), 0);
    });
    it('sumA()', () => {
      assert.strictEqual(evaluator.evaluate('[1,2,3].sumA()'), 6);
    });
    it('Combinations', () => {
      assert.deepEqual(evaluator.evaluate('[1,2,3].mapA("fac").reverseA()'), [6, 2, 1]);
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
      evaluator.defineFunction('myFunc', function (a, b) {
        return a * b;
      });
      assert.strictEqual(evaluator.evaluate('myFunc(2, 3)'), 6);
    });
  });

  describe('Custom infix operators', () => {
    it('Should add custom infix operator', () => {
      evaluator.defineInfixOperator('#', {
        lbp: 40,
        ev: function (a, b) {
          return a.ev() + b.ev();
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


  describe('Strings', () => {
    it('Should recognize strings', () => {
      evaluator.defineFunction('stringer', function (x) {
        return 'a_' + x;
      });
      assert.strictEqual(evaluator.evaluate('stringer("myString")'), 'a_myString');
    });
  });

  describe('Arrays', () => {
    it('Should recognize arrays', () => {
      evaluator.defineFunction('summer', function () {
        var sum = 0;
        for (var i = 0; i < arguments.length; i++) {
          sum += arguments[i];
        }
        return sum;
      });
      assert.strictEqual(evaluator.evaluate('summer([1,4/2,3])'), 6);
    });
  });

});
