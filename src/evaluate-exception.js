function EvaluateException (type, message) {
  this.type = type;
  this.message = message;
}

EvaluateException.prototype.toString = function () {
  return this.type + ': ' + this.message;
};

EvaluateException.TYPE_ARGUMENT_RANGE = 'Argument Range';
EvaluateException.TYPE_BAD_TOKEN = 'Bad Token';
EvaluateException.TYPE_DIVIDE_BY_ZERO = 'Divide by Zero';
EvaluateException.TYPE_UNDEFINED_SYMBOL = 'Undefined Symbol';

module.exports = EvaluateException;
