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
    var keys = [];
    for (var k in m_activeSymbol) {
      keys.push(k);
    }
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

/**
 * Adds a symbol to collection.
 * @method addSymbol
 * @param symbol {Object}
 */
function addSymbol (symbol) {
  m_symbolTable[symbol.id] = symbol;
}

/**
 * Adds a constant symbol to collection.
 * @method addConstantSymbol
 * @param id {String} Symbol identifier.
 * @param value {Number} Symbol value.
 */
function addConstantSymbol (id, value) {
  addSymbol(ConstantSymbol(id, value));
}

/**
 * Adds a simple symbol with only id to collection.
 * @method addSimpleSymbol
 * @param id {String} Symbol identifier.
 */
function addSimpleSymbol (id) {
  addSymbol(Symbol(id));
}

/**
 * Populates symbol table with all pre-defined symbols.
 * @method createSymbolTable
 */
function createSymbolTable () {

  addSimpleSymbol(':');
  addSimpleSymbol(',');
  addSimpleSymbol(')');
  addSimpleSymbol(']');
  addSimpleSymbol('}');
  addSimpleSymbol(END_TOKEN_ID);
  addConstantSymbol(LITERAL_TOKEN_ID, 0);

  // Constants.
  addConstantSymbol('FALSE', 0);
  addConstantSymbol('TRUE', 1);
  addConstantSymbol('E', Math.E);
  addConstantSymbol('LN2', Math.log(2));
  addConstantSymbol('LN10', Math.log(10));
  addConstantSymbol('PI', Math.PI);
  addConstantSymbol('SQRT1_2', 1 / Math.sqrt(2));
  addConstantSymbol('SQRT2', Math.sqrt(2));

  // Prefix operators.
  addSymbol(PrefixNot());
  addSymbol(PrefixParen());
  addSymbol(PrefixBracket());
  addSymbol(PrefixBrace());

  // Infix operators.
  addSymbol(InfixAdd());
  addSymbol(InfixSubtract());
  addSymbol(InfixMultiply());
  addSymbol(InfixDivide());
  addSymbol(InfixPow());
  addSymbol(InfixEqual());
  addSymbol(InfixNotEqual());
  addSymbol(InfixLessThan());
  addSymbol(InfixLessThanOrEqual());
  addSymbol(InfixGreaterThan());
  addSymbol(InfixGreaterThanOrEqual());
  addSymbol(InfixTernary());
  addSymbol(InfixAnd());
  addSymbol(InfixOr());

  // Functions (single argument).
  addSymbol(FuncAbs('abs'));
  addSymbol(FuncAcos('acos'));
  addSymbol(FuncAsin('asin'));
  addSymbol(FuncAtan('atan'));
  addSymbol(FuncCeiling('ceiling'));
  addSymbol(FuncCos('cos'));
  addSymbol(FuncExp('exp'));
  addSymbol(FuncFloor('floor'));
  addSymbol(FuncLog('log'));
  addSymbol(FuncLn('ln'));
  addSymbol(FuncNot('not'));
  addSymbol(FuncRand('rand'));
  addSymbol(FuncRound('round'));
  addSymbol(FuncSin('sin'));
  addSymbol(FuncSqrt('sqrt'));
  addSymbol(FuncTan('tan'));

  // Functions (multiple arguments).
  addSymbol(FuncAnd('and'));
  addSymbol(FuncChoose('choose'));
  addSymbol(FuncIf('if'));
  addSymbol(FuncMax('max'));
  addSymbol(FuncMean('mean'));
  addSymbol(FuncMin('min'));
  addSymbol(FuncModulo('mod'));
  addSymbol(FuncOr('or'));
  addSymbol(FuncPow('pow'));
  addSymbol(FuncProduct('product'));
  addSymbol(FuncQuotient('quotient'));
  addSymbol(FuncRandInt('randInt'));
  addSymbol(FuncRandRange('randRange'));
  addSymbol(FuncSum('sum'));
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
 * Returns new constant symbol.
 * @method ConstantSymbol
 * @param id {String} Unique identifier.
 * @param value {Number} Value for symbol.
 * @return {Object} Original symbol with id and value properties.
 */
function ConstantSymbol (id, value) {
	return Symbol(id, {
		value: value,
		ev: function () {
			return this.value;
		}
	});
}


/**
 * Returns new prefix operator symbol.
 * @method PrefixSymbol
 * @param id {String} Unqiue identifier.
 * @return {Object} New symbol.
 */
function PrefixSymbol (id, props) {
	return Symbol(id, extend({
		nud: function () {
			this.first = expression(70);
			return this;
		}
	}, props));
}

function PrefixNot () {
	return PrefixSymbol('!', {
		ev: function () {
			return this.first.ev() > 0 ? 0 : 1;
		}
	});
}

function PrefixParen () {
	return PrefixSymbol('(', {
		nud: function () {
			var s = expression(0);
			advance(')');
			return s;
		}
	});
}

function PrefixBracket () {
	return PrefixSymbol('[', {
		nud: function () {
			var s = expression(0);
			advance(']');
			return s;
		}
	});
}

function PrefixBrace () {
	return PrefixSymbol('{', {
		nud: function () {
			var s = expression(0);
			advance('}');
			return s;
		}
	});
}


/**
 * Returns new infix operator symbol.
 * @method InfixSymbol
 * @param id {String} Unique identifier.
 * @param lbp {Number} Left binding power.
 * @return {Object} New symbol.
 */
function InfixSymbol (id, lbp, props) {

	return Symbol(id, extend({
		lbp: lbp,
		led: function (symbol) {
			this.first = symbol;
			this.second = expression(this.lbp);
			return this;
		}
	}, props));
}

function InfixAdd () {
	return InfixSymbol('+', 50, {
		ev: function () {
			return this.first.ev() + this.second.ev();
		}
	});
}

function InfixSubtract () {

	return InfixSymbol('-', 50, {

		// For case of prefix operator.
		nud: function () {
			this.first = expression(70);
			this.isPrefix = true;
			return this;
		},
		ev: function () {
			return this.isPrefix ? -this.first.ev() : this.first.ev() - this.second.ev();
		}
	});
}

function InfixMultiply () {
	return InfixSymbol('*', 60, {
		ev: function () {
			return this.first.ev() * this.second.ev();
		}
	});
}

function InfixDivide () {
	return InfixSymbol('/', 60, {
		ev: function () {
			var den = this.second.ev();
			if (den === 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_DIVIDE_BY_ZERO,
					'Attempt to divide by 0 using the "/" operator.'
				);
			}
			return this.first.ev() / den;
		}
	});
}

function InfixPow () {
	return InfixSymbol('^', 70, {
		ev: function () {
			return Math.pow(this.first.ev(), this.second.ev());
		}
	});
}

function InfixEqual () {
	return InfixSymbol('==', 40, {
		ev: function () {
			return this.first.ev() === this.second.ev() ? 1 : 0;
		}
	});
}

function InfixNotEqual () {
	return InfixSymbol('!=', 40, {
		ev: function () {
			return this.first.ev() === this.second.ev() ? 0 : 1;
		}
	});
}

function InfixLessThan () {
	return InfixSymbol('<', 40, {
		ev: function () {
			return this.first.ev() < this.second.ev() ? 1 : 0;
		}
	});
}

function InfixLessThanOrEqual () {
	return InfixSymbol('<=', 40, {
		ev: function () {
			return this.first.ev() <= this.second.ev() ? 1 : 0;
		}
	});
}

function InfixGreaterThan () {
	return InfixSymbol('>', 40, {
		ev: function () {
			return this.first.ev() > this.second.ev() ? 1 : 0;
		}
	});
}

function InfixGreaterThanOrEqual () {
	return InfixSymbol('>=', 40, {
		ev: function () {
			return this.first.ev() >= this.second.ev() ? 1 : 0;
		}
	});
}

function InfixTernary () {
	return InfixSymbol('?', 20, {
		led: function (symbol) {
			this.first = symbol;
			this.second = expression(0);
			advance(':');
			this.third = expression(0);
			return this;
		},
		ev: function () {
			return this.first.ev() ? this.second.ev() : this.third.ev();
		}
	});
}


/**
 * Returns new right-associated infix operator.
 * @method InfixRSymbol
 * @param id {String} Identifier.
 * @param lbp {Number} Left binding power.
 * @return {Object} New symbol.
 */
function InfixRSymbol (id, lbp, props) {
	return Symbol(id, extend({
		lbp: lbp,
		led: function (symbol) {
			this.first = symbol;
			this.second = expression(this.lbp - 1);
			return this;
		}
	}, props));
}

function InfixAnd () {
	return InfixRSymbol('&&', 30, {
		ev: function () {
			return this.first.ev() && this.second.ev() ? 1 : 0;
		}
	});
}

function InfixOr () {
	return InfixRSymbol('||', 30, {
		ev: function () {
			return this.first.ev() || this.second.ev() ? 1 : 0;
		}
	});
}




/**
 * Creates new single-parameter function.
 * @method Func1Symbol
 * @param id {String} Function name.
 * @return {Object} New symbol.
 */
function Func1Symbol (id, props) {
	return Symbol(id, extend({
		nud: function () {
			advance('(');
			this.param = expression(0);
			advance(')');
			return this;
		}
	}, props));
}

function FuncRand (id) {
	return Symbol(id, {
		nud: function () {
			advance('(');
			advance(')');
			return this;
		},
		ev: function () {
			return Math.random();
		}
	});
}

function FuncAbs (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.abs(this.param.ev());
		}
	});
}

function FuncAcos (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a < -1 || a > 1) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "acos(' + a + ')": argument must be in range [-1, 1].'
				);
			}
			return Math.acos(a);
		}
	});
}

function FuncAsin (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a < 0 || a > 1) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "asin(' + a + ')": argument must be in range [0, 1].'
				);
			}
			return Math.asin(a);
		}
	});
}

function FuncAtan (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a < -1 || a > 1) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "atan(' + a + ')": argument must be in range [-1, 1].'
				);
			}
			return Math.atan(a);
		}
	});
}

function FuncCeiling (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.ceil(this.param.ev());
		}
	});
}

function FuncCos (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.cos(this.param.ev());
		}
	});
}

function FuncExp (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.exp(this.param.ev());
		}
	});
}

function FuncFloor (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.floor(this.param.ev());
		}
	});
}

function FuncLog (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a <= 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "log(' + a + ')": argument must be greater than 0.'
				);
			}
			return Math.log(10) / Math.log(a);
		}
	});
}

function FuncLn (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a <= 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "ln(' + a + ')": argument must be greater than 0.'
				);
			}
			return Math.log(a);
		}
	});
}

function FuncNot (id) {
	return Func1Symbol(id, {
		ev: function () {
			return this.param.ev() > 0 ? 0 : 1;
		}
	});
}

function FuncRound (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.round(this.param.ev());
		}
	});
}

function FuncSin (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.sin(this.param.ev());
		}
	});
}

function FuncSqrt (id) {
	return Func1Symbol(id, {
		ev: function () {
			var a = this.param.ev();
			if (a <= 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "sqrt(' + a + ')": argument must be greater than 0.'
				);
			}
			return Math.sqrt(a);
		}
	});
}

function FuncTan (id) {
	return Func1Symbol(id, {
		ev: function () {
			return Math.tan(this.param.ev());
		}
	});
}



/**
 * Creates new symbol for function with two or more arguments.
 * @method FuncSymbol
 * @param id {String} Function name.
 * @param props {Object} Additional mix-in properties.
 * @return {Object} New symbol.
 */
function FuncSymbol (id, props) {
	return Symbol(id, extend({
		paramValue: function (i) {
			return this.params[i].ev();
		},
		mapParamValues: function () {
			return this.params.map(function (p) {
				return p.ev();
			});
		},
		nud: function () {

			// A hack to reset params after symbol has been cloned.
			this.params = [];

			advance('(');
			while (1) {
				this.params.push(expression(0));
				if (m_activeSymbol.id != ',') {
					break;
				}
				advance(',');
			}
			advance(')');
			return this;

		}
	}, props));
}

function FuncAnd (id) {
	return FuncSymbol(id, {
		ev: function () {
			for (var i = 0, n = this.params.length; i < n; i++) {
				if (this.params[i].ev() <= 0) {
					return 0;
				}
			}
			return 1;
		}
	});
}

function FuncChoose (id) {
	return FuncSymbol(id, {
		ev: function () {
			var i = this.params[0].ev();
			if (i < 1 || i > this.params.length) {
				throw new EvaluateException(
          EvaluateException.TYPE_ARGUMENT_RANGE,
					'At "choose(' + i + ',...)": the index is out of bounds.'
				);
			}
			return this.params[i].ev();
		}
	});
}

function FuncIf (id) {
	return FuncSymbol(id, {
		ev: function () {
			return this.params[0].ev() > 0 ? this.params[1].ev() : this.params[2].ev();
		}
	});
}

function FuncMax (id) {
	return FuncSymbol(id, {
		ev: function () {
			return Math.max.apply(null, this.mapParamValues());
		}
	});
}

function FuncMean (id) {
	return FuncSymbol(id, {
		ev: function () {
			return this.mapParamValues().reduce(function (prev, next) { return prev + next; }) / this.params.length;
		}
	});
}

function FuncMin (id) {
	return FuncSymbol(id, {
		ev: function () {
			return Math.min.apply(null, this.mapParamValues());
		}
	});
}

function FuncModulo (id) {
	return FuncSymbol(id, {
		ev: function () {
			var a = this.params[1].ev();
			if (a === 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_DIVIDE_BY_ZERO,
					'At "mod(' + a + ')": cannot divide by 0.'
				);
			}
			return this.params[0].ev() % a;
		}
	});
}

function FuncOr (id) {
	return FuncSymbol(id, {
		ev: function () {
			for (var i = 0, n = this.params.length; i < n; i++) {
				if (this.params[i].ev() > 0) {
					return 1;
				}
			}
			return 0;
		}
	});
}

function FuncPow (id) {
	return FuncSymbol(id, {
		ev: function () {
			return Math.pow(this.params[0].ev(), this.params[1].ev());
		}
	});
}

function FuncProduct (id) {
	return FuncSymbol(id, {
		ev: function () {
			return this.mapParamValues().reduce(function (prev, next) { return prev * next; });
		}
	});
}

function FuncQuotient (id) {
	return FuncSymbol(id, {
		ev: function () {
			const div = this.params[0].ev();
			const den = this.params[1].ev();
			if (den === 0) {
				throw new EvaluateException(
          EvaluateException.TYPE_DIVIDE_BY_ZERO,
					'At "quotient(' + div + ', ' + den + ')": cannot divide by 0.'
				);
			}
			return Math.floor(div / den);
		}
	});
}

function FuncRandInt (id) {
	return FuncSymbol(id, {
		ev: function () {
			const a = this.params[0].ev();
			return a + parseInt(Math.random() * (this.params[1].ev() - a));
		}
	});
}

function FuncRandRange (id) {
	return FuncSymbol(id, {
		ev: function () {
			var a = this.params[0].ev();
			return a + Math.random() * (this.params[1].ev() - a);
		}
	});
}

function FuncSum (id) {
	return FuncSymbol(id, {
		ev: function () {
			return this.mapParamValues().reduce(function (a, b) { return a + b; });
		}
	});
}





createSymbolTable();

module.exports = {

 /**
  * Evalutes provided tokens.
  * @method evaluate
  * @param tokens {Any[]} Can be numbers or strings denoting functions, operators, constants, or custom definitions.
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
