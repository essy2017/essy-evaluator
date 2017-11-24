Javascript Expression Parser and Evaluator
==========================================

Description
-------------------------------------
Provides classes and methods for parsing and evaluating Javascript string
expressions. The module can be used to replace some functionality provided by
Javascript's `eval` but also allows for custom operator and function definitions
to enable a custom pseudo programming language.

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

### Parser([config {Object}])
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

### parse(expression {String})
Parses an expression into tokens. `parse` returns an array of simple token objects, 
each with properties `type {String}` and `value {Any}`. The token type can be one of the 
following:  

  - *name* All strings not enclosed in quotes are converted to name tokens. The value is 
    equal to the name.
  - *number* Numbers represented in decimal or scientific notiation.
  - *operator* Any operator defined in the operator list. 
