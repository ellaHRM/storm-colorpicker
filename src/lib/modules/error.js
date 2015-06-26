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
  this.debug = Array.prototype.slice.call(arguments, 1);
}

SCPError.prototype = new Error();

// end lib/error.js
