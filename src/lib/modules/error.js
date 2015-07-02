// lib/error.js

/**
 * Custom error handler
 * @param message
 * @param (params)
 * @constructor
 */
function SCPError(message, params) {
  this.name = 'SCPError';
  this.message = message;
  this.stack = (new Error()).stack;

  if (arguments.length > 1) {
    this.format(params);
  }
}

/**
 * Replace message string with parameters
 * @param params
 */
SCPError.prototype.format = function(params) {
  if (Array.isArray(params)) {
    return this.message.replace(/({[a-zA-Z0-9]+})/ig, function () {
      return params.shift();
    });
  }
};

SCPError.prototype = new Error();

// end lib/error.js
