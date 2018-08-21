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
     * @return {String} the generated SQL statement(the first array element) and the corresponding
     * parameters to be bound to the SQL statement(the second array element).
     */
    makeFetchSql (query) {
        let clauses = [
            this.buildSelect(query.getSelect()),
            this.buildFrom(query.getFrom()),
            this.buildCondition(query),
            this.buildGroupBy(query.getGroupBy()),
            this.buildHaving(query),
            this.buildOrderBy(query.getOrderBy()),
            this.buildLimit(query.getLimit(), query.getOffset())
        ];
        return clauses.filter(clause => clause.length > 0).join(' ');
    }

    /**
     * Generates a SELECT SQL statement from a {@link Query} .
     * @param {Query} query the {@link Query} object from which the SQL statement will be generated.
     * @return {String} the generated SQL statement(the first array element) and the corresponding
     * parameters to be bound to the SQL statement(the second array element).
     */
    makeInsertSql (query) {
        let data = query.getData();
        let fields = [];
        let values = [];
        for (let k in data) {
            fields.push(this.quoteColumnName(k));
            values.push('?');
            query.binds.push(data[k]);
        }
        let clauses = [
            'INSERT',
            this.quoteTable(query.getTable()),
            '(' + fields.join(',') + ')',
            'VALUES',
            '(' + values.join(',') + ')'
        ];
        return clauses.filter(clause => clause.length > 0).join(' ');
    }

    /**
     * Generates a UPDATE SQL statement from a {@link Query} .
     * @param {Query} query the {@link Query} object from which the SQL statement will be generated.
     * @return {String} the generated SQL statement(the first array element) and the corresponding
     * parameters to be bound to the SQL statement(the second array element).
     */
    makeUpdateSql (query) {
        let data = query.getData();
        let fields = [];
        for (let k in data) {
            fields.push(this.quoteColumnName(k) + '=?');
            query.binds.push(data[k]);
        }
        let clauses = [
            'UPDATE',
            this.quoteTable(query.getTable()),
            'SET ' + fields.join(','),
            this.buildCondition(query),
            this.buildOrderBy(query.getOrderBy()),
            this.buildLimit(query.getLimit(), query.getOffset())
        ];
        return clauses.filter(clause => clause.length > 0).join(' ');
    }

    /**
     * Generates a DELETE SQL statement from a {@link Query} .
     * @param {Query} query the {@link Query} object from which the SQL statement will be generated.
     * @return {String} the generated SQL statement(the first array element) and the corresponding
     * parameters to be bound to the SQL statement(the second array element).
     */
    makeDeleteSql (query) {
        let clauses = [
            'DELETE FROM',
            this.quoteTable(query.getTable()),
            this.buildCondition(query),
            this.buildOrderBy(query.getOrderBy()),
            this.buildLimit(query.getLimit(), query.getOffset())
        ];
        return clauses.filter(clause => clause.length > 0).join(' ');
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
        let asReg = /(.*) AS (.*)/i;
        let funcReg = /(.*)\((.*)\)(.*)/;
        let retResult1;
        let retResult2;
        for(let [i, elem] of columns.entries()) {
            retResult1 = elem.match(funcReg);
            if(retResult1) {
                elem = retResult1[1] + '(' + this.quoteColumnName(retResult1[2]) + ')' + retResult1[3];
            }
            retResult2 = elem.match(asReg);
            if(retResult2) {
                if(retResult1){
                    columns[i] = retResult2[1] + this.quoteColumnName(retResult2[2]);
                } else {
                    columns[i] = this.quoteColumnName(retResult2[1]) + ' AS ' + this.quoteColumnName(retResult2[2]);
                }
            } else if(!retResult1) {
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

    _buildJoinCondition(condition) {
        return condition;


        let str = '';

        for (let i=0; i<condition.length; i++) {
            let s1 = '';

            s1 = this._buildOperand(condition[i][1], query);
            for(let j=2; j<condition[i].length; j++){
                s1 = '(' + s1 + ') ' + condition[i][j][0] + ' (' + this._buildOperand(condition[i][j].slice(1), query) + ')';
            }

            if(util.isEmpty(str)){
                str = s1;
            } else {
                str = '(' + str + ') ' + condition[i][0] + ' (' + s1 + ')';
            }
        }

        if(!util.isEmpty(str))
            str = 'ON ' + str;
        return str;
    }

    buildJoin (joins) {
        let arr = [];
        for (let i=0; i<joins.length; i++) {
            arr.push(joins[i][0] + ' ' + this.quoteTable(joins[i][1]) + ' ON ' + this._buildJoinCondition(joins[i][2]));
        }
        return arr.join(' ');
    }

    /**
     * Build 'and' condition
     * @param object params
     * @param array binds
     */
    _buildOperand (params, query) {
        let operator = params[1].toUpperCase();
        switch (operator) {
            case '=':
            case '>':
            case '>=':
            case '<':
            case '<=':
                query.binds.push(params[2]);
                return this.quoteColumnName(params[0]) + operator + '?';
            case 'IN':
                query.binds.push(params[2]);
                return this.quoteColumnName(params[0]) + ' IN (?)';
            case 'LIKE':
            case 'NOT LIKE':
                query.binds.push(params[2]);
                return this.quoteColumnName(params[0]) + ' ' + operator + ' ?';
            case 'BETWEEN':
            case 'NOT BETWEEN':
                query.binds.push(params[2]);
                query.binds.push(params[3]);
                return this.quoteColumnName(params[0]) + ' ' + operator + ' ? AND ?';
        }
    }

    /**
     * [['id', '=', 10], ['and', 'time', '>', 1000], ['and', 'title', 'like', '%hello%']]
     * @param condition
     * @param array binds
     */
    buildCondition (query) {
        let str = '';
        let condition = query.getWhere();

        for (let i=0; i<condition.length; i++) {
            let s1 = '';

            s1 = this._buildOperand(condition[i][1], query);
            for(let j=2; j<condition[i].length; j++){
                s1 = '(' + s1 + ') ' + condition[i][j][0] + ' (' + this._buildOperand(condition[i][j].slice(1), query) + ')';
            }

            if(util.isEmpty(str)){
                str = s1;
            } else {
                str = '(' + str + ') ' + condition[i][0] + ' (' + s1 + ')';
            }
        }

        if(!util.isEmpty(str))
            str = 'WHERE ' + str;
        return str;
    }

    /**
     * [['id', '=', 10], ['and', 'time', '>', 1000], ['and', 'title', 'like', '%hello%']]
     * @param condition
     * @param array binds
     */
    buildHaving (query) {
        let str = '';
        let condition = query.getHaving();

        for (let i=0; i<condition.length; i++) {
            let s1 = '';

            s1 = this._buildOperand(condition[i][1], query);
            for(let j=2; j<condition[i].length; j++){
                s1 = '(' + s1 + ') ' + condition[i][j][0] + ' (' + this._buildOperand(condition[i][j].slice(1), query) + ')';
            }

            if(util.isEmpty(str)){
                str = s1;
            } else {
                str = '(' + str + ') ' + condition[i][0] + ' (' + s1 + ')';
            }
        }

        if(!util.isEmpty(str))
            str = 'HAVING ' + str;
        return str;
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
        for(let i=0; i<orderBy.length; i++) {
            arr.push(this.quoteColumnName(orderBy[i][0]) + (util.isEmpty(orderBy[i][1]) ? '' : ' ' + orderBy[i][1]));
        }

        return 'ORDER BY ' + arr.join(', ');
    }

    buildGroupBy (groupBy) {
        if(util.isEmpty(groupBy)) {
            return '';
        }

        let arr = [];
        for(let i=0; i<groupBy.length; i++) {
            arr.push(this.quoteColumnName(groupBy[i]));
        }

        return 'GROUP BY ' + arr.join(', ');
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
        if(!util.isEmpty(limit) && !util.isEmpty(offset)) {
            return 'LIMIT ' + offset + ', ' + limit;
        } else if(!util.isEmpty(limit)) {
            return 'LIMIT ' + limit;
        }
        return '';
    }

    _quoteTable (table){
        return '`' + table + '`';
    }

    _quoteDb (db){
        return '`' + db + '`';
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
        let asReg = /(.*) AS (.*)/i;
        let funcReg = /(.*)(\.)(.*)/;
        let retResult1;
        let retResult2;
        let ret = '';

        retResult1 = table.match(funcReg);
        if(retResult1) {
            ret = this._quoteDb(retResult1[1]) + '.';
            table = retResult1[3];
        }
        retResult2 = table.match(asReg);
        if(retResult2) {
            ret += this._quoteTable(retResult2[1]) + ' AS ' + this._quoteTable(retResult2[2]);
        } else if(!retResult1) {
            ret += this._quoteTable(table);
        }

        return ret;
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
        let funcReg = /(.*)\((.*)\)/;
        let regRet = name.match(funcReg);

        if(regRet) {
            name = regRet[2];
        }

        let names = name.split('.');

        for(let i=0; i<names.length; i++) {

            if(names[i][0] !== '`') {
                names[i] = '`' + names[i] + '`';
            } else {
                names[i] = names[i];
            }
        }

        if(regRet)
            return regRet[1] + '(' + names.join('.') + ')';
        else
            return names.join('.');
    }
}

module.exports = SqlBuilder;