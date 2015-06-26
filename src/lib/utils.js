// lib/utils.js

SCP.utils = {};

/**
 * Returns @obj if defined or @initial
 * @param obj
 * @param initial
 * @returns {*}
 */
SCP.utils.getVal = function (obj, initial) {
  return obj !== undefined ? obj : (initial !== undefined ? initial : null);
};

/**
 * Returns @selector's element or throws a TypeError
 * @param selector
 * @throws TypeError
 * @returns {Element}
 */
SCP.utils.findElement = function (selector) {
  var el = document.querySelector(selector);

  if (el) {
    return el;
  }

  throw new SCPError('Element "' + selector + '" not found on the page');
};

/**
 * Returns true if @obj is string
 * @param obj
 * @returns {boolean}
 */
SCP.utils.isString = function(obj) {
  return 'string' === typeof obj;
};

/**
 * Returns true if @fn is function
 * @param fn
 * @returns {boolean}
 */
SCP.utils.isFunction = function (fn) {
  return 'function' === typeof fn;
};

/**
 * Extends @parent object with children objects
 * @param parent
 * @param child
 */
SCP.utils.extends = function(parent, child) {
  var children = Array.prototype.slice.call(arguments, 1),
    k;

  children.map(function(child) {
    for (k in child) {
      if (parent.hasOwnProperty(k)) {
        parent[k] = child[k];
      }
    }
  });
};

// end lib/utils.js
