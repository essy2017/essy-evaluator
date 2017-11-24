/*******************************************************************************
 *
 * The Evaluator and Parser classes are based adapted from an article by
 * Douglas Crockford, "Top Down Operator Precedence", published 2007-02-21 and
 * available at https://www.crockford.com/javascript/tdop/tdop.html. This
 * article was in turn based on a talk given by Vaughan Pratt.
 *
 ******************************************************************************/

import { Evaluator } from './src/evaluator';
import { EvaluateException } from './src/evaluate-exception';
import { Parser } from './src/parser';
import { ParseException } from './src/parse-exception';

export default {
  Evaluator         : Evaluator,
  EvaluateException : EvaluateException,
  Parser            : Parser,
  ParseException    : ParseException
};
