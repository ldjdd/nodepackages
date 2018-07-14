/**
 * Provide common methods.
 * @module util
 */

/**
 * Find whether the type of a variable is string.
 * @param {mixed} val The variable being evaluated.
 * @return {boolean} Returns **true** if val is of type string, **false** otherwise
 */
exports.isString = function (val) {
    return Object.prototype.toString.call(val) === '[object String]';
}

/**
 * Find whether the type of a variable is array.
 * @param {mixed} val The variable being evaluated.
 * @return {boolean} Returns **true** if val is of type array, **false** otherwise
 */
exports.isArray = function (val) {
    return Object.prototype.toString.call(val) === '[object Array]';
}