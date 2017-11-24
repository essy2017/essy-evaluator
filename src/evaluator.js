var EvaluateException = require('./evaluate-exception.js');
var m_symbolTable = {};
var m_activeSymbol;
var m_tokenSet;
var m_tokenIndex = 0;
var m_customDefs = [];
var NUMBER_TOKEN = 'number';
var END_TOKEN_ID = '(end)';
var LITERAL_TOKEN_ID = '(literal)';




/**
 * Makes a new Symbol instance from the next simple token in the tokenSet collection and
 * assigns it to the static activeSymbol property.
 * @method advance
 * @param id {String} [optional] Provide to set a limit on right bounds of expression. Eg, for function would advance to "," in loop and then to ")".
 * @return {Symbol} The next symbol in the expression.
 * @static
 * @private
 */
function advance (id) {

  var o, t;

  if (id && m_activeSymbol && m_activeSymbol.id !== id) {
    throw new EvaluateException(
      EvaluateException.TYPE_BAD_TOKEN,
      'Expected token with id "' + id + '".'
    );
  }

  // Last token so return.
  if (m_tokenIndex >= m_tokenSet.length) {
    m_activeSymbol = m_symbolTable[END_TOKEN_ID];
    return m_activeSymbol;
  }

  t = m_tokenSet[m_tokenIndex];
  m_tokenIndex += 1;

  if (typeof t === 'number') {
    o = m_symbolTable[LITERAL_TOKEN_ID];
    m_activeSymbol = Object.create(o);
    m_activeSymbol.value = t;
  }
  else {
    o = m_symbolTable[t];
    if (!o) {
      throw new EvaluateException(
        EvaluateException.TYPE_UNDEFINED_SYMBOL,
        'The symbol "' + t + '" is not defined.'
      );
    }
    m_activeSymbol = Object.create(o);
  }

  return m_activeSymbol;
}

/**
 * Evaluates an expression.
 * @method expression
 * @param rbp {Number} Right binding power of calling symbol.
 * @return {Symbol} The resulting symbol.
 * @static
 * @private
 */
function expression (rbp) {

  var s = m_activeSymbol, left;
  advance();
  left = s.nud();

  while (rbp < m_activeSymbol.lbp) {
    s = m_activeSymbol;
    advance();
    left = s.led(left);
  }

  return left;
}



/*******************************************************************************
 *
 * Default symbol definitions.
 *
 ******************************************************************************/

/**
 * Populates symbol table with all pre-defined symbols.
 * @method createSymbolTable
 * @static
 * @private
 */
function createSymbolTable () {

  // Define simple symbols.
  [':', ',', ')', ']', '}', END_TOKEN_ID].forEach(function (id) {
    defineSymbol(id);
  });

  // Define constants.
  defineConstants({
    'FALSE'   : 0,
    'TRUE'    : 1,
    'E'       : Math.E,
    'LN2'     : Math.log(2),
    'LN10'    : Math.log(10),
    'PI'      : Math.PI,
    'SQRT1_2' : 1 / Math.sqrt(2),
    'SQRT2'   : Math.sqrt(2)
  });
  defineConstant(LITERAL_TOKEN_ID, 0);


  // Define prefix operators.
  definePrefixOperators({

    '!': {
      ev: function () {
        return this.first.ev() > 0 ? 0 : 1;
      }
    },

    '(': {
      nud: function () {
        var s = expression(0);
        advance(')');
        return s;
      }
    },

    '[': {
      nud: function () {
       var s = expression(0);
       advance(']');
       return s;
      }
    },

    '{': {
      nud: function () {
        var s = expression(0);
        advance('}');
        return s;
      }
    }

  });

  // Define infix operators.
  defineInfixOperators({

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
        this.first = expression(70);
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
        this.second = expression(0);
        advance(':');
        this.third = expression(0);
        return this;
      },
      ev: function () {
        return this.firstValue() ? this.secondValue() : this.third.ev();
      }
    }
  });


  // Define right-associative infix operators.
  defineInfixROperators({

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
  defineFunctions({

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
        for (var i = 0; i < this.args.length; i++) {
          if (this.argValue(i) <= 0) {
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

      'max': function () {
        return Math.max.apply(null, this.argValues());
      },

      'mean': function () {
        return this.argValues().reduce(function (prev, next) { return prev + next; }) / this.args.length;
      },

      'min': function () {
        return Math.min.apply(null, this.argValues());
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
        for (var i = 0, n = this.args.length; i < n; i++) {
          if (this.argValue(i) > 0) {
            return 1;
          }
        }
        return 0;
      },

      'pow': function () {
        return Math.pow(this.argValue(0), this.argValue(1));
      },

      'product': function () {
        return this.argValues().reduce(function (prev, next) { return prev * next; });
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
        return this.argValues().reduce(function (a, b) { return a + b; });
      },

      'tan': function () {
        return Math.tan(this.argValue(0));
      }

    });

    // Special case for functions with no arguments.
    defineFunction('rand', function () {
      return Math.random();
    }, true);
}


/**
 * Defines constants.
 * @method defineConstants
 * @param cons {Object} Keys are ids and values are constant values.
 * @static
 * @private
 */
function defineConstants (cons) {
  for (var c in cons) {
    defineConstant(c, cons[c]);
  }
}

/**
 * Defines prefix operators.
 * @method definePrefixOperators
 * @param ops {Object} Keys are operator ids and values are objects with properties:
 *    ev {Function} [optional] Evaluation function.
 *    nud {Function} [optional] Null function.
 * @static
 * @private
 */
function definePrefixOperators (ops) {
  for (var o in ops) {
    definePrefixOperator(o, ops[o]);
  }
}

/**
 * Defines infix operators.
 * @method defineInfixOperators
 * @param ops {Object} Keys are operator ids and values are objects with properties:
 *    ev {Function} Evaluation function.
 *    lbp {Number} Left binding power.
 *    led {Function}
 *    nud {Function}
 * @static
 * @private
 */
function defineInfixOperators (ops) {
  for (var i in ops) {
    var op    = ops[i],
        funcs = {};
    for (var k in op) {
      if (k !== 'lbp') {
        funcs[k] = op[k];
      }
    }
    defineInfixOperator(i, op.lbp, funcs);
  }
}

/**
 * Defines right-associative infix operators.
 * @method defineInfixROperators
 * @param ops {Object} Keys are operator ids and values are objects with properties:
 *    ev {Function} Evaluation function.
 *    lbp {Number} Left binding power.
 * @static
 * @private
 */
function defineInfixROperators (ops) {
  for (var o in ops) {
    defineInfixROperator(o, ops[o].lbp, ops[o].ev);
  }
}

/**
 * Defines functions.
 * @method defineFunctions
 * @param functions {Object} Keys are function names and values are evaluation functions.
 * @static
 * @private
 */
function defineFunctions (functions) {
  for (var f in functions) {
    defineFunction(f, functions[f]);
  }
}


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

/**
 * Defines a symbol in symbol table.
 * @method defineSymbol
 * @param id {String} Unique name / identifier.
 * @param config {Object} Configuration for Symbol.
 * @static
 * @private
 */
function defineSymbol (id, config) {
  m_symbolTable[id] = Symbol(id, config || {});
}

/**
 * Defines a constant.
 * @method defineConstant
 * @param id {String} Constant.
 * @param value {Number} Constant value.
 * @static
 * @private
 */
function defineConstant (id, value) {
  defineSymbol(id, {
    value: value,
    ev: function () {
      return this.value;
    }
  });
}

/**
 * Defines a prefix operator.
 * @method definePrefixOperator
 * @param id {String} Operator.
 * @param functions {Object} Function overrides. Must include ev().
 */
function definePrefixOperator (id, functions) {
  defineSymbol(id, extend({
    nud: function () {
      this.first = expression(70);
      return this;
    }
  }, functions));
}

/**
 * Defines an infix operator.
 * @method defineInfixOperator
 * @param id {String} Operator.
 * @param lbp {Number} Left binding power.
 * @param functions {Object} Additional functions: must include ev().
 * @static
 * @private
 */
function defineInfixOperator (id, lbp, functions) {
  defineSymbol(id, extend({
    lbp: lbp,
    led: function (symbol) {
      this.first = symbol;
      this.second = expression(this.lbp);
      return this;
    },
    firstValue: function () {
      return this.first.ev();
    },
    secondValue: function () {
      return this.second.ev();
    }
  }, functions));
}

/**
 * Defines a right-associated infix operator.
 * @method defineInfixROperator
 * @param id {String} Identifier.
 * @param lbp {Number} Left binding power.
 * @param ev {Function} Evaluation function.
 * @static
 * @private
 */
function defineInfixROperator (id, lbp, ev) {
  defineSymbol(id, {
    lbp: lbp,
    led: function (symbol) {
      this.first = symbol;
      this.second = expression(this.lbp - 1);
      return this;
    },
    ev: ev
  });
}

/**
 * Defines a function.
 * @method defineFunction
 * @param id {String} Function name / symbol id.
 * @param ev {Function} Evaluation function.
 * @param noArgs {Boolean} [optional] True if function doesn't take arguments. Default is false.
 * @static
 * @private
 */
function defineFunction (id, ev, noArgs) {
  defineSymbol(id, extend({
    nud: function () {
      this.args = [];
      advance('(');
      if (!noArgs) {
        while (1) {
          this.args.push(expression(0));
          if (m_activeSymbol.id != ',') {
            break;
          }
          advance(',');
        }
      }
      advance(')');
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
    }
  }, { ev: ev }));
}


// Create default symbols.
createSymbolTable();

module.exports = {

  defineConstant: defineConstant,
  defineInfixOperator: defineInfixOperator,
  defineInfixROperator: defineInfixROperator,
  defineFunction: defineFunction,
  definePrefixOperator: definePrefixOperator,

  defineConstants: defineConstants,
  defineInfixOperators: defineInfixOperators,
  defineInfixROperators: defineInfixROperators,
  defineFunctions: defineFunctions,
  definePrefixOperators: definePrefixOperators,

 /**
  * Evalutes provided tokens.
  * @method evaluate
  * @param tokenObjs {Object[]} Each with type {String} and value {Any} properties.
  * @return {Number} Evaluation result.
  */
  evaluate: function (tokenObjs) {

    var tokens = [];
    for (var i = 0; i < tokenObjs.length; i++) {
      tokens.push(tokenObjs[i].value);
    }

    m_tokenSet = tokens;
    m_tokenIndex = 0;
    m_activeSymbol = 0;
    advance();
    var s = expression(0);
    return s.ev();
  }
};
