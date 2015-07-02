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

  throw new SCPError(SCP.errMsg.EL_NOT_FOUND_ON_PAGE, [selector]);
};

/**
 * Returns true if @obj is String
 * @param str
 * @returns {boolean}
 */
SCP.utils.isStr = function(str) {
  return 'string' === typeof str;
};

/**
 * Returns true if @fn is Function
 * @param fn
 * @returns {boolean}
 */
SCP.utils.isFunc = function (fn) {
  return 'function' === typeof fn;
};

/**
 * Returns true if @obj is Object
 * @param obj
 * @returns {boolean}
 */
SCP.utils.isObj = function (obj) {
  return 'object' === typeof obj;
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
    SCP.utils.mapObj(child, function(childVal) {
      parent[k] = childVal;
    });
  });
};

/**
 * Iterates throw own properties of @obj, calls @fn if defined.
 * @param obj
 * @param {mapObjFn} fn
 * @param fnContext - custom context
 */
SCP.utils.mapObj = function(obj, fn, fnContext) {
  var i = 0,
    prop;

  if (SCP.utils.isObj(obj)) {
    for (prop in obj) {
      if (obj.hasOwnProperty(prop) && SCP.utils.isFunc(fn)) {
        fnContext ? fn.call(fnContext, obj[prop], prop, obj, i) : fn(obj[prop], prop, obj, i);
        i++;
      }
    }
  }
};

/**
 * Calls on each own object's property
 * @callback mapObjFn
 * @param {*} value
 * @param {String} propertyName
 * @param {Object} object
 * @param {Number} iterator
 */

// end lib/utils.js
