import { ParseException } from './parse-exception';

/**
 * Default allowed operators.
 * @property defaultOperators
 * @static
 */
var defaultOperators = {
  '('  : 1,
  ')'  : 1,
  '['  : 1,
  ']'  : 1,
  '+'  : 1,
  '-'  : 1,
  '*'  : 1,
  '/'  : 1,
  '^'  : 1,
  '%'  : 1,
  '?'  : 1,
  ':'  : 1,
  ','  : 1,
  '<'  : 1,
  '<=' : 1,
  '>'  : 1,
  '>=' : 1,
  '==' : 1,
  '!=' : 1,
  '!'  : 1,
  '&&' : 1,
  '||' : 1
};

/*******************************************************************************
 *
 * Parser.
 * @class Parser
 * @constructor
 * @param config {Object} [optional] Configuration with properties:
 *    operators {Object} [optional] Override or add allowed operators.
 *    Keys are operators and values are truthy (to include) or falsely (to exclude).
 *
 ******************************************************************************/
export function Parser (config) {
  config = config || {};
  this.operators = defaultOperators;
  this.updateOperators(config.operators || {});
}

/**
 * Updates operators.
 * @method updateOperators
 * @param operators {Object} New overrides and additions.
 */
Parser.prototype.updateOperators = function (operators) {

  for (var k in operators) {
    this.operators[k] = operators[k];
  }

  // Update allowable prefixes and suffixes for multiple-character operators.
  this.opPrefix = '';
  this.opSuffix = '';
  for (var d in this.operators) {
    if (d.length > 1) {
      this.opPrefix += d[0];
      this.opSuffix += d[d.length - 1];
    }
  }
};

/**
 * Parses a string expression into tokens.
 * @method parse
 * @param txt {String} Expression.
 * @return {Object[]} Each object has "type" and "value" properties.
 * @throws ParseException
 */
Parser.prototype.parse = function (txt) {

  var c,						        // The current character.
      i = 0,					      // The index of the current character.
      length = txt.length,  // String length.
      n,						        // The number value.
      q,						        // The quote character.
      str,					        // The string value.
      result = [],          // An array to hold the results.

      make = function (type, value) {
        return {
          type  : type,
          value : value
        };
      };

  // Begin tokenization. If the source string is empty, return 0 value.
  txt = String(txt);
  if (!txt) {
    return [];
  }

  // Loop through this text, one character at a time.
  c = txt.charAt(i);
  while (c) {

    // Ignore whitespace.
    if (c <= ' ') {
      i += 1;
      c = txt.charAt(i);
    }

    // Name.
    else if (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '_') {
      str = c;
      i += 1;
      for (;;) {
        c = txt.charAt(i);
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') || c === '_') {
          str += c;
          i += 1;
        }
        else {
          break;
        }
      }
      result.push(make('name', str));
    }

    // Number. Numbers include exponentials. Numbers can start with a decimal point or digit.
    else if (c >= '0' && c <= '9' || c === '.') {
      str = c;
      i += 1;

      // Look for more digits.
      for (;;) {
        c = txt.charAt(i);
        if (c < '0' || c > '9') {
          break;
        }
        i += 1;
        str += c;
      }

      // Look for a decimal fraction part.
      if (c === '.') {
        i += 1;
        str += c;
        for (;;) {
          c = txt.charAt(i);
          if (c < '0' || c > '9') {
            break;
          }
          i += 1;
          str += c;
        }
      }

      // Look for an exponent part.
      if (c === 'e' || c === 'E') {
        i += 1;
        str += c;
        c = txt.charAt(i);
        if (c === '-' || c === '+') {
          i += 1;
          str += c;
          c = txt.charAt(i);
        }
        if (c < '0' || c > '9') {
          throw new ParseException(ParseException.TYPE_INVALID_EXPONENT, str + c);
        }
        do {
          i += 1;
          str += c;
          c = txt.charAt(i);
        } while (c >= '0' && c <= '9');
      }

      // Make sure the next character is not a letter.
      if (c >= 'a' && c <= 'z') {
        throw new ParseException(ParseException.TYPE_INVALID_NUMBER, str + c);
      }

      // Convert the string value to a number. If it is finite, then it is a good token.
      n = +str;
      if (isFinite(n)) {
        result.push(make('number', n));
      }
      else {
        throw new ParseException(ParseException.TYPE_INVALID_NUMBER, str);
      }

    }


    // String.
    else if (c === '\'' || c === '"') {
      str = '';
      q = c;
      i += 1;
      for (;;) {
        c = txt.charAt(i);
        if (c < ' ') {
          throw new ParseException(ParseException.TYPE_UNTERMINATED_STRING, str);
        }

        // Look for the closing quote.
        if (c === q) {
          break;
        }

        str += c;
        i += 1;
      }
      i += 1;
      result.push(make('string', str));
      c = txt.charAt(i);
    }

    // Combining operators.
    else if (this.opPrefix.indexOf(c) >= 0) {
      str = c;
      i += 1;
      while (i < length) {
        c = txt.charAt(i);
        if (this.opSuffix.indexOf(c) < 0) {
          break;
        }
        str += c;
        i += 1;
      }
      if (!this.operators[str]) {
        throw new ParseException(ParseException.TYPE_INVALID_OPERATOR, str);
      }
      result.push(make('operator', str));

      // Check for end of string (can't end in operator -- causes infinite loop).
      if (i >= length) {
        throw new ParseException(ParseException.TYPE_TRAILING_OPERATOR, str);
      }
    }

    // Single-character operator.
    else {
      i += 1;

      if (!this.operators[c]) {
        throw new ParseException(ParseException.TYPE_INVALID_OPERATOR, c);
      }
      result.push(make('operator', c));

      // Check for end of string (can't end in operator -- causes infinite loop).
      if (i >= length && c !== ')' && c !== ']') {
        throw new ParseException(ParseException.TYPE_TRAILING_OPERATOR, c);
      }

      c = txt.charAt(i);

    }
  }
  return result;
};


module.exports = Parser;
