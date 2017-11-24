/*******************************************************************************
 *
 * Class for representing Parser exceptions.
 * @class ParseError
 * @constructor
 *
 ******************************************************************************/
export function ParseException (type, message) {
  this.type = type;
  this.message = message;
}

/**
 * Return string representation of error.
 * @method toString
 * @return {String} Exception type and message.
 */
ParseException.prototype.toString = function () {
  return this.type + ': ' + this.message;
};

/**
 * Type for invalid exponent.
 * @property TYPE_INVALID_EXPONENT
 * @type String
 * @static
 */
ParseException.TYPE_INVALID_EXPONENT = 'Invalid Exponent';

/**
 * Type for invalid number.
 * @property TYPE_INVALID_NUMBER
 * @type String
 * @static
 */
ParseException.TYPE_INVALID_NUMBER = 'Invalid Number';

/**
 * Type for invalid operator.
 * @property TYPE_INVALID_OPERATOR
 * @type String
 * @static
 */
ParseException.TYPE_INVALID_OPERATOR = 'Invalid Operator';

/**
 * Type for trailing operator.
 * @property TYPE_TRAILING_OPERATOR
 * @type String
 * @static
 */
ParseException.TYPE_TRAILING_OPERATOR = 'Trailing Operator';

/**
 * Type for unterminated string.
 * @property TYPE_UNTERMINATED_STRING
 * @type String
 * @static
 */
ParseException.TYPE_UNTERMINATED_STRING = 'Unterminated String';

module.exports = ParseException;
