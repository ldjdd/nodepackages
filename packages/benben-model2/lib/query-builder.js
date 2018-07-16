const util = require('./util');

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
exports.selectSql = function (query) {
    let clauses = [
        exports.buildSelect(query.getSelect()),
        exports.buildFrom(query.getFrom()),
        exports.buildOrderBy(query.getOrderBy()),
        exports.buildLimit(query.getLimit(), query.getOffset())
    ];
    return [clauses.filter(clause => clause.length > 0).join(' ')];
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

    if(util.isEmpty(columns)) {
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
    return 'FROM ' + exports.quoteTable(table);
}

/**
 * Parses the condition specification and generates the corresponding SQL expression.
 * @param {array} condition The condition specification. it looks like this:
 * **[{name: 'benben'}, ['or', {id: 22}]]**.
 * Please refer to {@link Query#where Query::where()} on
 * how to specify a condition.
 * @param {object} params The binding parameters to be populated.
 * @return string the generated SQL expression.
 */
exports.buildCondition = function (condition, params) {
    for (let [index, elem] of condition.entries()) {
        if(util.isObject(elem)) {
            for (let [key, value] of entries(elem)) {
                [
                    ['conjunction', 'operand', 'parameters', '...'],
                    ['and', 'eq', 'id', ':name', 2],
                    ['and', 'like', 'name', ':name', 'benben'],
                    ['and', 'gt', 'age', ':name', 22],
                    ['and', 'in', 'level', [1, 2] ],
                    ['and', '&', 'level', 2 ],
                ]
            }
        }
    }
}

/**
 * Generates the ORDER BY part of query.
 *
 * Table can be specified in the following two formats:
 *
 * You should use the string format when the table has no alias:
 * - string: 'user'
 *
 * You should use the array format when the table has a alias(index 0 is table name and index 1 is alias of table)：
 * - array: ['user', 'u']
 *
 * @param {object} orderBy the order by columns. See {@link Query#orderBy} for more details on how to
 * specify this parameter.
 * @return {string} the ORDER BY part of query.
 * @example
 * // ORDER BY `id` DESC, `coin` ASC
 * builder.buildOrderBy({'id': 'DESC', 'coin': 'ASC'});
 */
exports.buildOrderBy = function (orderBy) {
    if(util.isEmpty(orderBy)) {
        return '';
    }

    let arr = [];
    for(let k in orderBy) {
        arr.push(exports.quoteColumnName(k) + ' ' + orderBy[k]);
    }

    return 'ORDER BY ' + arr.join(', ');
}

/**
 * Generates the LIMIT part of query.
 *
 * @param {int} limit The limit.
 * @param {int} offset The offset.Don't set the value to disable offset.
 * @return {string} The LIMIT part of query.
 * @example
 * // LIMIT 5, 10
 * builder.buildLimit(10, 5);
 */
exports.buildLimit = function (limit, offset) {
    if(util.isSet(limit) && util.isSet(offset)) {
        return 'LIMIT ' + offset + ', ' + limit;
    } else if(util.isSet(limit)) {
        return 'LIMIT ' + limit;
    }
    return '';
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