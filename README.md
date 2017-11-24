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
`Parser.parse()` as well as define custom operators, functions, and names.

#### evaluate (tokens {Object[]})
Evaluates array of tokens returned from `Parser.parse()` and returns result, typically 
a number.

The `evaluate()` method will throw an `EvaluateException` in the following cases:
  - Unrecognized token.
  - Unexpected token (e.g., missing or misplaced parentheses).
  - Division by zero.
  - Invalid arguments provided to function (e.g., sqrt(-2)).

### defineName (id {String}, value {Any})
Defines a custom name. This can be useful if you want to define custom constant 
values or include variables in your expressions.

    var essy      = require('essy-evaluator');
    var parser    = new essy.Parser();
    var evaluator = new essy.Evaluator();
    var tokens    = parser.parse('3 + myCustomName');
    
    evaluator.defineName('myCustomName', 4);
    
    console.log(evaluator.evaluate(tokens)); // 7