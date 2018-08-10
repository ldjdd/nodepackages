const util = require('./util');
const fs = require('fs');

/**
 * Generates query statement.
 */
class SqlBuilder {
    constructor(){
        this.binds = [];
    }

    /**
     * Generates a SELECT SQL statement from a {@link Query} .
     * @param {Query} query the {@link Query} object from which the SQL statement will be generated.
     * @return {array} the generated SQL statement(the first array element) and the corresponding
     * parameters to be bound to the SQL statement(the second array element).
     */
    selectSql (query) {
        let clauses = [
            this.buildSelect(query.getSelect()),
            this.buildFrom(query.getFrom()),
            this.buildOrderBy(query.getOrderBy()),
            this.buildLimit(query.getLimit(), query.getOffset())
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
    buildSelect (columns, distinct) {
        let select = distinct ? 'SELECT DISTINCT ' : 'SELECT ';

        if(util.isEmpty(columns)) {
            return select + '*';
        }

        for(let [i, elem] of columns.entries()) {
            if(elem instanceof Array) {
                columns[i] = this.quoteColumnName(elem[0]) + ' AS ' + this.quoteColumnName(elem[1]);
            } else { // Others as a string
                columns[i] = this.quoteColumnName(elem)
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
    buildFrom (table) {
        return 'FROM ' + this.quoteTable(table);
    }

    /**
     * [['id', '=', 10], ['and', 'time', '>', 1000], ['and', 'title', 'like', '%hello%']]
     * @param condition
     * @param array binds
     */
    _buildCondition (condition, query) {
        let str = '';
        let link = '';
        let tmp = '';
        fs.writeFile('d:/tmp/node.js', JSON.stringify(condition), {flag:'a'}, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
        for (let i=0; i<condition.length; i++) {
            link = condition[i][0];
            if(util.isArray(condition[i][1])){
                tmp = this._buildCondition(condition[i][1], query);
            } else {
                tmp = this._buildOperand(condition[i].splice(1), query);
            }

            if(util.isEmpty(str)){
                str = tmp;
            } else {
                str = '(' + str + ') ' + link + ' (' + tmp + ')';
            }
        }
        return str;
    }

    /**
     * Build 'and' condition
     * @param object params
     * @param array binds
     */
    _buildOperand (params, query) {
        switch (params[1]) {
            case '=':
                query.binds.push(params[2]);
                return this.quoteColumnName(params[0]) + ' = ?';
            case '>':
                query.binds.push(params[2]);
                return this.quoteColumnName(params[0]) + ' > ?';
        }
    }

    /**
     * [['id', '=', 10], ['and', 'time', '>', 1000], ['and', 'title', 'like', '%hello%']]
     * @param condition
     * @param array binds
     */
    buildCondition (query) {
        return this._buildCondition(query.getWhere(), query);
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
    buildOrderBy (orderBy) {
        if(util.isEmpty(orderBy)) {
            return '';
        }

        let arr = [];
        for(let k in orderBy) {
            arr.push(this.quoteColumnName(k) + ' ' + orderBy[k]);
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
    buildLimit (limit, offset) {
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
    quoteTable (table) {
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
    quoteColumnName (name) {
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
}

module.exports = SqlBuilder;