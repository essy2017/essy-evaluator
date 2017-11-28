Javascript Expression Parser and Evaluator
==========================================

Description
-------------------------------------
Parses and evaluates Javascript string expressions. The module can be used to
replace some functionality provided by
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
    var evaluator = new essy.Evaluator();
    var result;

    // Use built-in operators.
    result = evaluator.evaluate('2 * 3'); // 6

    // Use built-in functions.
    result = evaluator.evaluate('max(1, 3, 2) + 4'); // 7

    // Use custom definitions.
    evaluator.defineName('myCustomName', 8);
    result = evaluator.evaluate('myCustomName / 4'); // 2

    // Equivalently pass custom definitions to evaluate.
    result = evaluator.evaluate('myCustomName / 4', { myCustomName: 8 }); // 2

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
  - '.'
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
each with properties `type {String}` and `value {Any}`. Throws a `ParseException`
on invalid expression.

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
The Evaluator class provides methods to evaluate an expression or array of tokens returned from
`Parser.parse()` as well as define custom operators, functions, and names. See below
the methods section for lists of pre-defined constants, operators, and functions.

#### Methods

##### evaluate (exp {String|Object[]} [, names {Object}])
Evaluates expression `exp`, either a string or array of tokens returned from `Parser.parse()`.
Returns result of evaluation, typically a number.

An optional `names` argument can be provided to specify custom definitions. This is a shortcut
to calling `Evaluator.defineName()`.

The `evaluate()` method will throw an `EvaluateException` in the following cases:
  - Unrecognized token.
  - Unexpected token (e.g., missing or misplaced parentheses).
  - Division by zero.
  - Invalid arguments provided to function (e.g., sqrt(-2)).

Examples:  

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var result;

    // Simple evaluation of string.
    result = evaluator.evaluate('1 + 2');    // 3

    // Evaluation of tokens.
    var tokens = parser.parse('1 + 2');
    result = evaluator.evaluate(tokens);    // 3

    // Defining names.
    result = evaluator.evaluate('1 + myConstant', { myConstant: 2 }); // 3


##### defineFunction (name {String}, ev {Function} [, noArgs {Boolean}])
Defines a custom function. The `name` is the name for the function and `ev` is
the function body. The `noArgs` flag should be set to true if the function does
not accept any arguments; by default this value is false.

    var essy      = require('essy-evaluator');
    var evaluator = new essy.Evaluator();

    evaluator.defineFunction('addTwoNumbers', function (a, b) {
      return a + b;
    });

    var result = evaluator.evaluate('addTwoNumbers(2, 3)'); // 5

You can also define functions that accept an arbitrary number of arguments:

    var essy      = require('essy-evaluator');
    var evaluator = new essy.Evaluator();

    evaluator.defineFunction('addNumbers', function () {

      var sum = 0;

      for (var i = 0; i < arguments.length; i++) {
        sum += arguments[i];
      }

      return sum;
    });

    var result = evaluator.evaluate('addNumbers(1, 2, 3, 4)'); // 10

    // An array as a first argument is applied to the function.
    result = evaluator.evaluate('addNumbers([1, 2, 3, 4])'); // 10


##### defineName (name {String}, value {Any})
Defines a custom name. This can be useful if you want to define custom constant
values or include variables in your expressions.

    var essy      = require('essy-evaluator');
    var evaluator = new essy.Evaluator();

    evaluator.defineName('myCustomName', 4);

    var result = evaluator.evaluate('3 + myCustomName'); // 7

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


#### Pre-defined Operators
`Evaluator` defines the following operators by default:

Operator | Example     | Description    | Returns
:------- | :---------- | :------------- | :------
\+       | x + y       | Addition       | Sum of x and y.
\-       | x - y       | Subtraction    | The difference between x and y.
\*       | x * y       | Multiplication | The product of x and y.
/        | x / y       | Division       | x divided by y.
^        | x ^ y       | Exponentiation | x raised to the y.
!        | !x          | Logical not    | 0 if x is greater than 0, else 1.
&&       | x && y      | Logical and    | 1 if x and y are greater than 0, else 0.
\|\|     | x \|\| y    | Logical or     | 1 if x or y is greater than 0, else 0.
? :      | x ? y : z   | Ternary        | y if x is greater than 0, else z.
()       | x * (y + z) | Parentheses    | Grouping for operator precedence.


#### Pre-defined Functions
`Evaluator` defines the following functions by default. Functions that accept an
arbitrary number of arguments (e.g., `and`, `max`, etc.) will also accept an
array as a single argument.

    evaluator.evaluate('and(1,2,3)') === evaluator.evaluate('and([1,2,3])');

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
fac(x)                  | Returns factorial of x.
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

#### Pre-defined Array Functions
`Evaluator` includes various common functions to operate on arrays. Functions
that return arrays can be chained.

##### andA()
Returns 1 if all elements in array are greater than 0, else returns 0.

    result = evaluator.evaluate('[1, 2, 3].andA()'); // 1

##### everyA(fn)
Calls `fn` on every element and returns 1 if `fn` returns true in all cases.

    evaluator.defineFunction('threshold', function (x) {
      return x < 5;
    });
    result = evaluator.evaluate('[1, 2, 3].everyA("threshold")');  // 1
    result = evaluator.evaluate('[1, 2, 6].everyA("threshold")');  // 0

##### filterA(fn)
Filters elements using `fn`.

    evaluator.defineFunction('myFilter', function (x) {
      return x < 3;
    });
    result = evaluator.evaluate('[1, 2, 4, 5].filterA("myFilter")');  // [1, 2]

##### includesA(x)
Returns 1 if array includes element `x`, else returns 0.

    result = evaluator.evaluate('["a", "b"].includesA("a")'); // 1

##### joinA(joiner)
Joins array elements into string using `joiner`.

    result = evaluator.evaluate(["a", "b", "c"].joinA("-")); // "a-b-c"

##### mapA(fn)
Maps elements using `fn`.

    result = evaluator.evaluate('[1, 2, 3].mapA("fac")');  // [1, 2, 6]

##### maxA()
Returns element with maximum value.

    result = evaluator.evaluate('[1, 2, 3].maxA()'); // 3

##### meanA()
Returns mean of elements.

    result = evaluator.evaluate('[1, 2, 3].meanA()'); // 2

##### medianA()
Returns median of elements.

    result = evaluator.evaluate('[1, 2, 3].medianA()'); // 2

##### minA()
Returns element with minimum value.

    result = evaluator.evaluate('[1, 3, 5].minA()'); // 1

##### orA()
Returns 1 if any element is greater than 0.

    result = evaluator.evaluate('[1, 2, 3].orA()'); // 1

##### productA()
Returns product of elements.

    result = evaluator.evaluate('[1, 2, 3].productA()'); // 6

##### reduceA(fn, acc)
Reduces array using `fn`. An optional initial value for the accumulator can
be specified as `acc`. If not provided the first element in the array will be used.
The provided `fn` accepts four arguments:

  - accumulator: Accumulated result.
  - currentValue: Value of current array element.
  - index: [optional] Index of current array element.
  - array: [optional] The array `a`.

Example:

    evaluator.defineFunction('summer', function (accumulator, currentValue, index, array) {
      return accumulator + currentValue;
    });
    result = evaluator.evaluate('[1, 2, 3].reduceA("summer", 0)'); // 6

##### reverseA()
Returns reversed array.

    result = evaluator.evaluate('[1, 2, 3].reverseA()'); // [3, 2, 1]

##### sliceA(start [,end])
Returns slice of array.

    result = evaluator.evaluate('[1, 2, 3, 4].sliceA(1, 3)'); // [2, 3]

##### someA(fn)
Returns 1 if `fn` returns true for any element.

    evaluator.defineFunction("checkSome", function (x) {
      return x > 3;
    });
    result = evaluator.evaluate('[1, 3, 5].someA("checkSome")'); // 1

##### sumA()
Returns sum of elements.

    result = evaluator.evaluate('[1, 2, 3].sumA()'); // 6
