import { EvaluateException } from './evaluate-exception';
import { Parser } from './parser';

var END_TOKEN_ID     = '(end)',
    LITERAL_TOKEN_ID = '(literal)';

/**
 * Simple single-depth extend utility function.
 * @method extend
 * @param o1 {Object} Source object.
 * @param o2 {Object} [optional] Object with mix-in properties.
 * @return {Object} Modified o1.
 */
function extend (o1, o2) {
  if (o2) {
    for (var p in o2) {
      if (o2.hasOwnProperty(p)) {
        o1[p] = o2[p];
      }
    }
  }
  return o1;
}

/**
 * Creates symbol template.
 * @method Symbol
 * @param id {String} Symbol id.
 * @param lbp {Number} [optional] Left binding power.
 * @return {Object} New object.
 */
function Symbol (id, props) {

  var o = Object.create({
    id: id,
    lbp: 0,
    nud: function () {
      return this;
    },
    led: function (/*left*/) {
      return this;
    },
    ev: function () {
      return 0;
    }
  });

  return extend(o, props);
}


/*****************************************************************
 *
 * Evaluates expressions.
 * @class Evaluator
 * @constructor
 *
 ****************************************************************/
export function Evaluator () {
  this.symbolTable = {};
  this.tokenIndex = 0;
  this.tokenSet = null;
  this.activeSymbol = null;

  this.defineSymbols();
}

Evaluator.prototype = {

 /**
  * Makes a new Symbol instance from the next simple token in the tokenSet
  * collection and assigns it to the activeSymbol property.
  * @method advance
  * @param id {String} [optional] Provide to set a limit on right bounds of expression. Eg, for function would advance to "," in loop and then to ")".
  * @return {Symbol} The next symbol in the expression.
  */
  advance: function (id) {

    var o, t;

    if (id && this.activeSymbol && this.activeSymbol.id !== id) {
      throw new EvaluateException(
        EvaluateException.TYPE_BAD_TOKEN,
        'Expected token with id "' + id + '".'
      );
    }

    // Last token so return.
    if (this.tokenIndex >= this.tokenSet.length) {
      this.activeSymbol = this.symbolTable[END_TOKEN_ID];
      return this.activeSymbol;
    }

    t = this.tokenSet[this.tokenIndex];
    this.tokenIndex += 1;

    if (t.type === 'number' || t.type === 'string') {
      o = this.symbolTable[LITERAL_TOKEN_ID];
      this.activeSymbol = Object.create(o);
      this.activeSymbol.value = t.value;
    }
    else {
      o = this.symbolTable[t.value];
      if (!o) {
        throw new EvaluateException(
          EvaluateException.TYPE_UNDEFINED_SYMBOL,
          'The symbol "' + t.value + '" is not defined.'
        );
      }
      this.activeSymbol = Object.create(o);
    }

    return this.activeSymbol;
  },

 /**
  * Evaluates token collection.
  * @method evaluate
  * @param exp {String|Object[]} Expression or tokens, each with type {String} and value {Any} properties.
  * @param names {Object} [optional] Names to define.
  */
  evaluate: function (exp, names) {

    if (typeof exp === 'string') {
      var parser = new Parser();
      exp = parser.parse(exp);
    }

    if (names) {
      this.defineNames(names);
    }

    this.tokenSet = exp;
    this.tokenIndex = 0;
    this.activeSymbol = 0;
    this.advance();
    var s = this.expression(0);
    return s.ev();
  },

 /**
  * Evaluates an expression.
  * @method expression
  * @param rbp {Number} Right binding power of calling symbol.
  * @return {Symbol} The resulting symbol.
  */
  expression: function (rbp) {
    var s = this.activeSymbol, left;
    this.advance();
    left = s.nud();

    while (rbp < this.activeSymbol.lbp) {
      s = this.activeSymbol;
      this.advance();
      left = s.led(left);
    }

    return left;
  },



 /******************************************************************************
  *
  * Symbol definitions.
  *
  *****************************************************************************/

 /**
  * Defines a function.
  * @method defineFunction
  * @param id {String} Function name / symbol id.
  * @param ev {Function} Evaluation function.
  * @param noArgs {Boolean} [optional] True if function doesn't take arguments. Default is false.
  */
  defineFunction: function (id, ev, noArgs) {
    this.defineSymbol(id, extend({
      nud: function () {
        this.args = [];
        this.evaluator.advance('(');
        if (!noArgs) {
          while (1) {
            this.args.push(this.evaluator.expression(0));
            if (this.evaluator.activeSymbol.id != ',') {
              break;
            }
            this.evaluator.advance(',');
          }
        }
        this.evaluator.advance(')');
        return this;
      },
      argValue: function (i) {
        return this.args[i].ev();
      },
      argValues: function () {
        var values = [];
        for (var i = 0; i < this.args.length; i++) {
          values.push(this.args[i].ev());
        }
        return values;
      },
      argArray: function () {
        var a = this.argValue(0);
        return typeof a === 'object' ? a : this.argValues();
      }
    }, { ev: ev }));
  },

 /**
  * Defines functions.
  * @method defineFunctions
  * @param functions {Object} Keys are function names and values are evaluation functions.
  */
  defineFunctions: function (functions) {
    for (var f in functions) {
      this.defineFunction(f, functions[f]);
    }
  },

 /**
  * Defines an infix operator.
  * @method defineInfixOperator
  * @param id {String} Operator.
  * @param lbp {Number} Left binding power.
  * @param functions {Object} Additional functions: must include ev().
  */
  defineInfixOperator: function (id, lbp, functions) {
    this.defineSymbol(id, extend({
      lbp: lbp,
      led: function (symbol) {
        this.first = symbol;
        this.second = this.evaluator.expression(this.lbp);
        return this;
      },
      firstValue: function () {
        return this.first.ev();
      },
      secondValue: function () {
        return this.second.ev();
      }
    }, functions));
  },

 /**
  * Defines infix operators.
  * @method defineInfixOperators
  * @param ops {Object} Keys are operator ids and values are objects with properties:
  *    ev {Function} Evaluation function.
  *    lbp {Number} Left binding power.
  *    led {Function} [optional]
  *    nud {Function} [optional]
  */
  defineInfixOperators: function (ops) {
    for (var i in ops) {
      var op    = ops[i],
          funcs = {};
      for (var k in op) {
        if (k !== 'lbp') {
          funcs[k] = op[k];
        }
      }
      this.defineInfixOperator(i, op.lbp, funcs);
    }
  },

 /**
  * Defines a right-associated infix operator.
  * @method defineInfixROperator
  * @param id {String} Identifier.
  * @param lbp {Number} Left binding power.
  * @param ev {Function} Evaluation function.
  */
  defineInfixROperator: function (id, lbp, ev) {
    this.defineSymbol(id, {
      lbp: lbp,
      led: function (symbol) {
        this.first = symbol;
        this.second = this.evaluator.expression(this.lbp - 1);
        return this;
      },
      ev: ev
    });
  },

 /**
  * Defines right-associative infix operators.
  * @method defineInfixROperators
  * @param ops {Object} Keys are operator ids and values are objects with properties:
  *    ev {Function} Evaluation function.
  *    lbp {Number} Left binding power.
  */
  defineInfixROperators: function (ops) {
    for (var o in ops) {
      this.defineInfixROperator(o, ops[o].lbp, ops[o].ev);
    }
  },

 /**
  * Defines a name in symbol table.
  * @method defineName
  * @param id {String} Name.
  * @param value {Any} Symbol value.
  */
  defineName: function (id, value) {
    this.defineSymbol(id, {
      value: value,
      ev: function () {
        return this.value;
      }
    });
  },

 /**
  * Defines names in symbol table.
  * @method defineNames
  * @param names {Object} Keys are names and values are constant values.
  */
  defineNames: function (names) {
    for (var n in names) {
      this.defineName(n, names[n]);
    }
  },

 /**
  * Defines a prefix operator in symbol table.
  * @method definePrefixOperator
  * @param id {String} Operator.
  * @param functions {Object} Should include ev() plus optional nud() or led().
  */
  definePrefixOperator: function (id, functions) {
    this.defineSymbol(id, extend({
      nud: function () {
        this.first = this.evaluator.expression(70);
        return this;
      }
    }, functions));
  },

 /**
  * Defines multiple prefix operators in symbol table.
  * @method definePrefixOperators
  * @param ops {Object} Keys are operator names and values are objects with function definitions.
  */
  definePrefixOperators: function (ops) {
    for (var o in ops) {
      this.definePrefixOperator(o, ops[o]);
    }
  },

 /**
  * Defines default symbols in table.
  * @method defineSymbols
  */
  defineSymbols: function () {

    var me = this;

    // Define basic symbols.
    [':', ',', ')', ']', '}', END_TOKEN_ID].forEach(function (id) {
      me.defineSymbol(id);
    });

    // Define constants.
    this.defineNames({
      'FALSE'   : 0,
      'TRUE'    : 1,
      'E'       : Math.E,
      'LN2'     : Math.log(2),
      'LN10'    : Math.log(10),
      'PI'      : Math.PI,
      'SQRT1_2' : 1 / Math.sqrt(2),
      'SQRT2'   : Math.sqrt(2)
    });
    this.defineName(LITERAL_TOKEN_ID, 0);

    // Define prefix operators.
    this.definePrefixOperators({

      '!': {
        ev: function () {
          return this.first.ev() > 0 ? 0 : 1;
        }
      },

      '(': {
        nud: function () {
          var s = this.evaluator.expression(0);
          this.evaluator.advance(')');
          return s;
        }
      },

      '[': {
        nud: function () {
          this.elements = [];
          while (1) {
            this.elements.push(this.evaluator.expression(0));
            if (this.evaluator.activeSymbol.id !== ',') {
              break;
            }
            this.evaluator.advance(',');
          }
          this.evaluator.advance(']');
          return this;
        },
        ev: function () {
          var a = [];
          for (var i = 0; i < this.elements.length; i++) {
            a.push(this.elements[i].ev());
          }
          return a;
        }
      },

      '{': {
        nud: function () {
          var s = this.evaluator.expression(0);
          this.evaluator.advance('}');
          return s;
        }
      }

    });

    // Define infix operators.
    this.defineInfixOperators({

      '+': {
        lbp: 50,
        ev: function () {
          return this.firstValue() + this.secondValue();
        }
      },

      '-': {
        lbp: 50,
        // For case of prefix operator.
        nud: function () {
          this.first = this.evaluator.expression(70);
          this.isPrefix = true;
          return this;
        },
        ev: function () {
          return this.isPrefix ? -this.firstValue() : this.firstValue() - this.secondValue();
        }
      },

      '*': {
        lbp: 60,
        ev: function () {
          return this.firstValue() * this.secondValue();
        }
      },

      '/': {
        lbp: 60,
        ev: function () {
          var den = this.secondValue();
          if (den === 0) {
            throw new EvaluateException(
              EvaluateException.TYPE_DIVIDE_BY_ZERO,
              'Attempt to divide by 0 using the "/" operator.'
            );
          }
          return this.firstValue() / den;
        }
      },

      '^': {
        lbp: 70,
        ev: function () {
          return Math.pow(this.firstValue(), this.secondValue());
        }
      },

      '==': {
        lbp: 40,
        ev: function () {
          return this.firstValue() === this.secondValue() ? 1 : 0;
        }
      },

      '!=': {
        lbp: 40,
        ev: function () {
          return this.firstValue() === this.secondValue() ? 0 : 1;
        }
      },

      '<': {
        lbp: 40,
        ev: function () {
          return this.firstValue() < this.secondValue() ? 1 : 0;
        }
      },

      '<=': {
        lbp: 40,
        ev: function () {
          return this.firstValue() <= this.secondValue() ? 1 : 0;
        }
      },

      '>': {
        lbp: 40,
        ev: function () {
          return this.firstValue() > this.secondValue() ? 1 : 0;
        }
      },

      '>=': {
        lbp: 40,
        ev: function () {
          return this.firstValue() >= this.secondValue() ? 1 : 0;
        }
      },

      '?': {
        lbp: 20,
        led: function (symbol) {
          this.first = symbol;
          this.second = this.evaluator.expression(0);
          this.evaluator.advance(':');
          this.third = this.evaluator.expression(0);
          return this;
        },
        ev: function () {
          return this.firstValue() ? this.secondValue() : this.third.ev();
        }
      }
    });

    // Define right-associative infix operators.
    this.defineInfixROperators({

      '&&': {
        lbp: 30,
        ev: function () {
          return this.first.ev() && this.second.ev() ? 1 : 0;
        }
      },

      '||': {
        lbp: 30,
        ev: function () {
          return this.first.ev() || this.second.ev() ? 1 : 0;
        }
      }

    });

    // Define functions.
    this.defineFunctions({

      // Single argument functions.
      'abs': function () {
        return Math.abs(this.argValue(0));
      },

      'acos': function () {
        var a = this.argValue(0);
        if (a < -1 || a > 1) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "acos(' + a + ')": argument must be in range [-1, 1].'
          );
        }
        return Math.acos(a);
      },

      'and': function () {
        var args = this.argArray();
        for (var i = 0; i < args.length; i++) {
          if (args[i] <= 0) {
            return 0;
          }
        }
        return 1;
      },

      'asin': function () {
        var a = this.argValue(0);
        if (a < 0 || a > 1) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "asin(' + a + ')": argument must be in range [0, 1].'
          );
        }
        return Math.asin(a);
      },

      'atan': function () {
        var a = this.argValue(0);
        if (a < -1 || a > 1) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "atan(' + a + ')": argument must be in range [-1, 1].'
          );
        }
        return Math.atan(a);
      },

      'ceiling': function () {
        return Math.ceil(this.argValue(0));
      },

      'choose': function () {
        var i = this.argValue(0);
        if (i < 1 || i > this.args.length) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "choose(' + i + ',...)": the index is out of bounds.'
          );
        }
        return this.argValue(i);
      },

      'cos': function () {
        return Math.cos(this.argValue(0));
      },

      'exp': function () {
        return Math.exp(this.argValue(0));
      },

      'fac': function () {
        function fac (x) {
          if (x < 0) return -1;
          if (x === 0) return 1;
          return x * fac(x - 1);
        }
        return fac(this.argValue(0));
      },

      'floor': function () {
        return Math.floor(this.argValue(0));
      },

      'if': function () {
        return this.argValue(0) > 0 ? this.argValue(1) : this.argValue(2);
      },

      'log': function () {
        var a = this.argValue(0);
        if (a <= 0) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "log(' + a + ')": argument must be greater than 0.'
          );
        }
        return Math.log(10) / Math.log(a);
      },

      'ln': function () {
        var a = this.argValue(0);
        if (a <= 0) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "ln(' + a + ')": argument must be greater than 0.'
          );
        }
        return Math.log(a);
      },

      'map': function () {

        var a      = this.argValue(0),
            func   = this.argValue(1),
            result = [];

        for (var i = 0; i < a.length; i++) {
          result.push(this.evaluator.evaluate(func + '(' + a[i] + ')'));
        }

        return result;
      },

      'max': function () {
        return Math.max.apply(null, this.argArray());
      },

      'mean': function () {

        var sum    = 0,
            values = this.argArray();

        for (var i = 0; i < values.length; i++) {
          sum += values[i];
        }
        return sum / values.length;
      },

      'median': function () {
        var values = this.argArray().sort(function (a, b) {
          return a - b;
        });
        if (values.length % 2 === 0) {
          return (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
        }
        else {
          return (values[(values.length - 1) / 2]);
        }
      },

      'min': function () {
        return Math.min.apply(null, this.argArray());
      },

      'mod': function () {
        var a = this.argValue(1);
        if (a === 0) {
          throw new EvaluateException(
            EvaluateException.TYPE_DIVIDE_BY_ZERO,
            'At "mod(' + a + ')": cannot divide by 0.'
          );
        }
        return this.argValue(0) % a;
      },

      'not': function () {
        return this.argValue(0) > 0 ? 0 : 1;
      },

      'or': function () {
        var args = this.argArray();
        for (var i = 0, n = args.length; i < n; i++) {
          if (args[i] > 0) {
            return 1;
          }
        }
        return 0;
      },

      'pow': function () {
        return Math.pow(this.argValue(0), this.argValue(1));
      },

      'product': function () {
        var product = 1,
            values  = this.argArray();
        for (var i = 0; i < values.length; i++) {
          product *= values[i];
        }
        return product;
      },

      'quotient': function () {
        var div = this.argValue(0);
        var den = this.argValue(1);
        if (den === 0) {
          throw new EvaluateException(
            EvaluateException.TYPE_DIVIDE_BY_ZERO,
            'At "quotient(' + div + ', ' + den + ')": cannot divide by 0.'
          );
        }
        return Math.floor(div / den);
      },

      'randInt': function () {
        var a = this.argValue(0);
        return a + parseInt(Math.random() * (this.argValue(1) - a));
      },

      'randRange': function () {
        var a = this.argValue(0);
        return a + Math.random() * (this.argValue(1) - a);
      },

      'round': function () {
        return Math.round(this.argValue(0));
      },

      'sin': function () {
        return Math.sin(this.argValue(0));
      },

      'sqrt': function () {
        var a = this.argValue(0);
        if (a <= 0) {
          throw new EvaluateException(
            EvaluateException.TYPE_ARGUMENT_RANGE,
            'At "sqrt(' + a + ')": argument must be greater than 0.'
          );
        }
        return Math.sqrt(a);
      },

      'sum': function () {

        var sum    = 0,
            values = this.argArray();

        for (var i = 0; i < values.length; i++) {
          sum += values[i];
        }
        return sum;
      },

      'tan': function () {
        return Math.tan(this.argValue(0));
      }

    });

    // Special case for functions with no arguments.
    this.defineFunction('rand', function () {
      return Math.random();
    }, true);
  },

 /**
  * Defines a Symbol in symbol table.
  * @method defineSymbol
  * @param id {String} Unique identifier for symbol.
  * @param config {Object} Configuration object passed to Symbol.
  */
  defineSymbol: function (id, config) {
    config = config || {};
    config.evaluator = this;
    this.symbolTable[id] = Symbol(id, config);
  },

 /**
  * Deletes a symbol.
  * @method deleteSymbol
  * @param id {String} Identifier.
  * @return {Boolean} True on success.
  */
  deleteSymbol: function (id) {
    return delete this.symbolTable[id];
  }

};
