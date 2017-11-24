/*******************************************************************************
 *
 * Class for representing Parser errors.
 * @class ParseError
 * @constructor
 *
 ******************************************************************************/
function ParseError (type, message) {
  this.type = type;
  this.message = message;
}

/**
 * Return string representation of error.
 * @method toString
 * @return {String} Error type and message.
 */
ParseError.prototype.toString = function () {
  return this.type + ': ' + this.message;
};

/**
 * Type for invalid exponent.
 * @property TYPE_INVALID_EXPONENT
 * @type String
 * @static
 */
ParseError.TYPE_INVALID_EXPONENT = 'Invalid Exponent';

/**
 * Type for invalid number.
 * @property TYPE_INVALID_NUMBER
 * @type String
 * @static
 */
ParseError.TYPE_INVALID_NUMBER = 'Invalid Number';

/**
 * Type for invalid operator.
 * @property TYPE_INVALID_OPERATOR
 * @type String
 * @static
 */
ParseError.TYPE_INVALID_OPERATOR = 'Invalid Operator';

/**
 * Type for trailing operator.
 * @property TYPE_TRAILING_OPERATOR
 * @type String
 * @static
 */
ParseError.TYPE_TRAILING_OPERATOR = 'Trailing Operator';

/**
 * Type for unterminated string.
 * @property TYPE_UNTERMINATED_STRING
 * @type String
 * @static
 */
ParseError.TYPE_UNTERMINATED_STRING = 'Unterminated String';

module.exports = ParseError;
