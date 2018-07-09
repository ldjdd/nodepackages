/**
 * QueryBuilder builds a SQL statement based on the specification given as a {@link Query} object.
 *
 * SQL statement are created from {@link Query} objects using the {@link QueryBuilder#build build()} method.
 *
 * @module QueryBuilder
 */

/**
 * @param {Query} query
 */
exports.build = function (query) {
    
}

/**
 * Generates the SELECT clause.
 * @param {array} columns The columns to be selected.
 * @param {array} params the bind parameters to be populated
 * @param {boolean} distinct
 * @return string the SELECT clause.
 * @example
 * // SELECT `id`, `name`
 * builder.buildSelect(['id', 'name']);
 * // SELECT `user`.`id` AS `user_id`, `name`
 * builder.buildSelect([['user.id', 'user_id'], 'name']);
 */
exports.buildSelect = function (columns, params, distinct) {
    let select = distinct ? 'SELECT DISTINCT' : 'SELECT';

    if(columns.length < 0) {
        return select + ' *';
    }

    for(let [i, elem] of columns.entries()) {
        if(elem instanceof Array) {
            columns[i] = exports.quoteColumnName(elem[0]) + ' AS ' + exports.quoteColumnName(elem[1]);
        } else { // Others as string
            columns[i] = exports.quoteColumnName(elem)
        }
    }

    return select + columns.join(', ')
}

/**
 * Quotes a column name for use in a query.
 *
 * If the column name contains prefix, the prefix will also propery quoted.
 * If the column name is already quoted, then this method will do nothing.
 * @param {string} name Column name
 * @return {string} The properly quoted column name
 */
exports.quoteColumnName = function(name) {
    
}