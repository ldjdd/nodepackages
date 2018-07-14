/**
 * QueryBuilder builds a SQL statement based on the specification given as a {@link Query} object.
 *
 * SQL statement are created from {@link Query} objects using the {@link QueryBuilder#build build()} method.
 *
 * @module QueryBuilder
 */

/**
 * Generates a SELECT SQL statement from a {@link Query} .
 * @param {Query} query the {@link Query} object from which the SQL statement will be generated.
 * @return {array} the generated SQL statement(the first array element) and the corresponding
 * parameters to be bound to the SQL statement(the second array element).
 */
exports.select = function (query) {
    let clauses = [
        exports.buildSelect(query.getSelect()),
        exports.buildFrom(query.getFrom())
    ];
}

/**
 * Generates the SELECT clause.
 * @param {array} columns The columns to be selected.
 * @param {boolean} distinct
 * @return string the SELECT clause.
 * @example
 * // SELECT `id`, `name`
 * builder.buildSelect(['id', 'name']);
 * // SELECT `user`.`id` AS `user_id`, `name`
 * builder.buildSelect([['user.id', 'user_id'], 'name']);
 */
exports.buildSelect = function (columns, distinct) {
    let select = distinct ? 'SELECT DISTINCT ' : 'SELECT ';

    if(columns.length < 0) {
        return select + '*';
    }

    for(let [i, elem] of columns.entries()) {
        if(elem instanceof Array) {
            columns[i] = exports.quoteColumnName(elem[0]) + ' AS ' + exports.quoteColumnName(elem[1]);
        } else { // Others as a string
            columns[i] = exports.quoteColumnName(elem)
        }
    }

    return select + columns.join(', ')
}

/**
 * Generates the FROM part of query
 *
 *
 *
 * Table can be specified in the following two formats:
 *
 * You should use the string format when the table has no alias:
 * - string: 'user'
 *
 * You should use the array format when the table has a alias(index 0 is table name and index 1 is alias of table)：
 * - array: ['user', 'u']
 *
 * @param {string|array} table Table name.
 * @return {string}
 * @example
 * // `user` AS `u`
 * builder.buildFrom(['user', 'u']);
 */
exports.buildFrom = function (table) {
    return exports.quoteTable(table);
}

/**
 * Quotes a table name for use in a query.
 * @param {string} table
 * @return {string}
 * @example
 * // `user`
 * builder.quoteTable('user');
 * // `user` AS `u`
 * builder.quoteTable(['user', 'u']);
 */
exports.quoteTable = function (table) {
    if(table instanceof Array) {
        return '`' + table[0] + '` AS `' + table[1] + '`';
    } else {
        return '`' + table + '`';
    }
}

/**
 * Quotes a column name for use in a query.
 *
 * If the column name contains prefix, the prefix will also propery quoted.
 * If the column name is already quoted, then this method will do nothing.
 * @param {string} name Column name
 * @return {string} The properly quoted column name
 * @example
 * // Return `id`
 * builder.quoteColumnName('id');
 * // Return `user`.`id`
 * builder.quoteColumnName('user.id');
 */
exports.quoteColumnName = function(name) {
    let names = name.split('.');
    for(let i=0; i<names.length; i++) {
        if(names[i][0] !== '`') {
            names[i] = '`' + names[i] + '`';
        } else {
            names[i] = names[i];
        }
    }
    return names.join('.');
}