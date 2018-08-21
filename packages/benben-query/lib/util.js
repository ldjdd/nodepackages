/**
 * Provide common methods.
 * @module util
 */

/**
 * Determin the variable is empty.
 * @param {mixed} val
 * @return {boolean} Returns **true** if val is exists and has a non-empty, non-zero value. **false** otherwise.
 */
exports.isEmpty = function (val) {
    return typeof(val) == 'undefined'
        || val === 0
        || val === false
        || (exports.isString(val) && val.length === 0)
        || (exports.isArray(val) && val.length === 0)
        || (exports.isObject(val) && Object.keys(val).length == 0);
}

/**
 * Determine the variable is set and is not undefined.
 * @param {mixed} val The variable to be checked.
 * @return {boolean} Returns **true** if val exists and has value other than undefined. **false** otherwise.
 */
exports.isSet = function (val) {
    let ret = true;
    for(let i=0; i<arguments.length; i++){
        ret = ret && typeof(arguments[i]) !== 'undefined';
    }
    return ret;
}

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

/**
 * Find whether the type of a variable is number.
 * @param {mixed} val The variable being evaluated.
 * @return {boolean} Returns **true** if val is of type number, **false** otherwise
 */
exports.isNumber = function (val) {
    return Object.prototype.toString.call(val) === '[object Number]';
}

/**
 * Find whether the type of a variable is Object.
 * @param {mixed} val The variable being evaluated.
 * @return {boolean} Returns **true** if val is of type Object, **false** otherwise
 */
exports.isObject = function (val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Find whether the two arrays are equal.
 * @param {array} v1
 * @param {array} v2
 * @returns {boolean} Returns **true** if v1 and v2 are equal, **false** otherwise
 */
exports.equalArray = function (v1, v2) {
    // if the other array is a false value, return
    if (!exports.isArray(v1) || !exports.isArray(v2))
        return false;
    // compare lengths - can save a lot of time
    if (v1.length != v2.length)
        return false;
    for (var i = 0, l = v1.length; i < l; i++) {
        // Check if we have nested arrays
        if (exports.isArray(v1[i]) && exports.isArray(v2[i])) {
            // recurse into the nested arrays
            if (!exports.equalArray(v1[i], v2[i]))
                return false;
        }
        else if (v1[i] != v2[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}