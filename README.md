Javascript Expression Parser and Evaluator
==========================================

Description
-------------------------------------
Provides classes and methods for parsing and evaluating Javascript string
expressions. The module can be used to replace some functionality provided by
Javascript's `eval` but also allows for custom operator and function definitions
to enable a custom pseudo programming language.

The module was created during development of 
[Essy Tree](https://essytree.com), online decision tree 
analysis software, where it is used in production.

Installation
-------------------------------------

    npm install essy-evaluator

Basic Usage
-------------------------------------

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var tokens    = parser.parse('2 * 3');
    
    console.log(evaluator.evaluate(tokens)); // 6

Documentation 
-------------------------------------

### Parser ###
The Parser class provides a method `parse()` to parse an expression. There is a
default set of recognized operators that can be customized.

#### Parser ([config {Object}])
Constructs a new `Parser` instance. Accepts an optional configuration object that can
be used to disable default operators or add new operators. For example, the following 
disables the default "+" operator and adds two custom operators, "#" and "$".

    var parser = new Parser({
      operators: {
        
        // Disable default "+" operator.
        '+': false,
        
        // Add custom "#" and "$" operators.
        '#': true,
        '$': true
      }
    });

By default the following operators are defined:
  - '('
  - ')'
  - '['
  - ']'
  - '+'
  - '-'
  - '*'
  - '/'
  - '^'
  - '%'
  - '?'
  - ':'
  - ','
  - '<'
  - '<='
  - '>'
  - '>='
  - '=='
  - '!='
  - '!'
  - '&&'
  - '||'

#### parse (expression {String})
Parses an expression into tokens. `parse()` returns an array of simple token objects, 
each with properties `type {String}` and `value {Any}`. The token type can be one of the 
following:  

  - __name__ All strings not enclosed in quotes are converted to name tokens. The value is 
    equal to the name.
  - __number__ Numbers represented in decimal or scientific notiation.
  - __operator__ Any operator defined in the operator list. 
  - __string__ Any string encapsulated in quotes.
  
`parse()` will throw a `ParseException` in the following cases:

  - Invalid number
  - Invalid trailing operator
  - Unrecognized operator 
  - Unterminated string 
  
#### updateOperators (operators {Object})
Updates valid operator list. Keys should be the operator (e.g., '+') and values indicate 
whether the operator is valid. Values can be "truthy" or "falsey".

    parser.updateOperators({
      
      // Disable some built-in operators. false or 0 work just as well.
      '+': false,
      '*': 0,
      
      // Add some custom operators.
      '$': true,
      '#': 1
    });


### Evaluator ###
The Evaluator class provides methods to evaluate an array of tokens returned from 
`Parser.parse()` as well as define custom operators, functions, and names. See below 
the methods section for lists of pre-defined constants, operators, and functions.

#### Methods

##### evaluate (tokens {Object[]})
Evaluates array of tokens returned from `Parser.parse()` and returns result, typically 
a number.

The `evaluate()` method will throw an `EvaluateException` in the following cases:
  - Unrecognized token.
  - Unexpected token (e.g., missing or misplaced parentheses).
  - Division by zero.
  - Invalid arguments provided to function (e.g., sqrt(-2)).

##### defineFunction (name {String}, ev {Function} [, noArgs {Boolean}])
Defines a custom function. The `name` is the name for the function and `ev` is 
the function body. The `noArgs` flag should be set to true if the function does 
not accept any arguments; by default this value is false.

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var tokens    = parser.parse('addTwoNumbers(2, 3)');
    
    evaluator.defineFunction('addTwoNumbers', function () {
      return this.argValue(0) + this.argValue(1);
    });
    
    console.log(evaluator.evaluate(tokens)); // 5

As seen above, the `ev` function has access to provided argument values 
via the `argValue()` method, which accepts an argument index. In the above, 
`argValue(0) === 2` and `argValue(1) === 3`.

You can also define functions that accept an arbitrary number of arguments:

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var tokens    = parser.parse('addNumbers(1,2,3,4)');
    
    evaluator.defineFunction('addNumbers', function () {
      
      var sum    = 0,
          values = this.argValues();
      
      for (var i = 0; i < values.length; i++) {
        sum += values[i];
      }
      
      return values;
    });
    
    console.log(evaluator.evaluate(tokens)); // 10

The above makes use of the `argValues()` method, which evaluates and returns all 
argument values.

##### defineName (name {String}, value {Any})
Defines a custom name. This can be useful if you want to define custom constant 
values or include variables in your expressions.

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var tokens    = parser.parse('3 + myCustomName');
    
    evaluator.defineName('myCustomName', 4);
    
    console.log(evaluator.evaluate(tokens)); // 7

Note that `defineName()` will overwrite any existing definition without warning.

#### Pre-defined Constants 
`Evaluator` defines the following constants by default:

Constant  | Description                 | Evaluates to
:-------- | :-------------------------- | :-----------
E         | Base of natural logarithm.  | ~2.718
FALSE     | False                       | 0
LN2       | Natural logarithm of 2      | ~0.693 
LN10      | Natural logartihm of 10     | ~2.302 
PI        | Pi                          | ~3.145 
SQRT1_2   | 1 over the square root of 2 | ~0.707 
SQRT2     | Square root of 2            | ~1.414 
TRUE      | True                        | 1


#### Pre-defined Functions
`Evaluator` defines a number of functions by default:

Function                | Description
:---------------------  | :----------
abs(x)                  | Returns absolute value of x.
acos(x)                 | Returns arccosine of x. Throws exception if x is not in range [-1, 1].
and(x0, x1, ... xN])    | Returns 1 if all arguments are greater than 0, else returns 0.
asin(x)                 | Returns arcsine of x. Throws exception if x is not in range [0, 1].
atan(x)                 | Returns arctangent of x. Throws exception if x is not in range [-1, 1].
ceiling(x)              | Returns x rounded up to nearest integer.
choose(x, y0, ... yN)   | Returns the argument at index x. x = 1 will return y0.
cos(x)                  | Returns cosine of x.
exp(x)                  | Returns e raised to x.
floor(x)                | Returns x rounded down to nearest integer.
if(x, y, z)             | Returns y if x is greater than 0, else returns z.
log(x)                  | Returns the base-10 logarithm of x. Throws exception if x is less than or equal to 0.
ln(x)                   | Returns the natural logarithm of x. Throws exception if x is less than or equal to 0.
max(x0, x1, ... xN)     | Returns the argument with the maximum value.
mean(x0, x1, ... xN)    | Returns the mean of the provided arguments.
median(x0, x1, ... xN)  | Returns the median of the provided arguments.
min(x0, x1, ... xN)     | Returns the argument with the minimum value.
mod(x, y)               | Returns x modulo y. Throws exception if y equals 0.
not(x)                  | Returns 0 if x is greater than 0, else returns 1.
or(x0, x1, ... xN)      | Returns 1 if any argument is greater than 0, else returns 0.
pow(x, y)               | Returns x raised to y.
product(x0, x1, ... xN) | Returns the product of all arguments.
quotient(x, y)          | Returns integer portion of x / y. Throws exception if y equals 0.
rand()                  | Returns a random number in the range [0, 1].
randInt(x, y)           | Returns a random integer in the range [x, y].
randRange(x, y)         | Returns a random number in the range [x, y].
round(x)                | Returns x rounded to the nearest integer.
sin(x)                  | Returns the sine of x.
sqrt(x)                 | Returns the square root of x. Throws exception if x is less than or equal to 0.
sum(x0, x1, ... xN)     | Returns the sum of provided arguments.
tan(x)                  | Returns the tangent of x.

 