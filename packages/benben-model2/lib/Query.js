const util = require('./util');
const fs = require('fs');

/**
 * Created by benben on 2018/7/8.
 */

/**
 * Query represents a SELECT SQL statement in a way that is independent of DBMS
 *
 * Query provides a set of methods to facilicate the specification of different clauses
 * in a SELECT statement. These methods can be chained together.
 *
 * For example,
 *
 * ```javascript
 * query = new Query();
 * query.select('id, name')
 *      .from('user')
 *      .limit(10);
 * ```
 *
 * Query internally uses the {@link QueryBuilder} class to generate the SQL statement.
 *
 */
class Query{
    /**
     * @param {Scheme} db
     */
    constructor(db){
        this.db = db;
        this._reset();
    }

    _reset() {
        this._select = [];
        this._orderBy = [];
        this._limit = 0;
        this._offset = 0;
        this._where = [];
        this.binds = [];
        this._data = {};
        this._table = '';
        /**
         * The context of execute which indicates the context is ALL,COLUMN,SCALAR,ROW,UPDATE,INSERT OR DELETE.
         * @type {String} The context value
         * @private
         */
        this._ctx = '';
    }

    /**
     * Get the select value
     * @return {array}
     */
    getSelect(){
        return this._select;
    }

    /**
     * Sets the SELECT part of the query.
     * @example
     * var query = new Query();
     * // columns as an array.
     * query.select(['id', 'name']);
     * // prefix with table names and/or contain column aliases.
     * query.select("user.id AS user_id, user.name");
     * query.select(['user.id AS user_id', 'user.name']);
     * @param {array} columns The columns to be selected.
     * Columns can be specified in either a string (e.g. "id, name") or an array (e.g. ['id', 'name']).
     * Columns can be prefixed with table names (e.g. "user.id") and/or contain column aliases
     * (e.g. "user.id AS user_id"). The method will automatically quote the column names.
     * @return {Query} The query object itself.
     */
    select(columns) {
        /*if(util.isString(columns)) {
            columns = columns.split(/\s*,\s*!/);
        }*/
        this._select = this._select.concat(columns);
        return this;
    }

    /**
     * Gets the FROM part of query
     * @return {string}
     */
    getFrom() {
        return this._table;
    }

    /**
     * Sets the FROM part of query.
     * @param {string} table The table to be selected from.
     * The method will automatically quote the table name.
     * @return {Query} The query object itself
     * @example
     * query.from('user');
     */
    from (table) {
        /*let arr = table.split(/\s*AS\s*!/);
        if(arr.length === 2) {
            this._from = arr;
        } else {
            this._from = table;
        }*/
        this._table = table;
        return this;
    }

    /**
     * Gets the ORDER BY part of query.
     * @return {string} The ORDER BY part of query.
     */
    getOrderBy () {
        return this._orderBy;
    }

    /**
     * Sets the ORDER BY part of query.
     * @param {String} field The column name.
     * @param {String} flag The value just is choice of Query.DESC or Query.ASC.
     * @return {Query} The query object itself
     */
    orderBy (field, flag) {
        /*if(util.isString(columns)) {
            let arr = columns.split(/\s*,\s*!/);
            let vArr;
            for(let v of Object.values(arr)) {
                vArr = v.split(/\s+/);
                this._orderBy[vArr[0]] = typeof vArr[1] == 'undefined' ? 'ASC' : vArr[1];
            }
        } else {*/
            this._orderBy.push([field, flag]);
        // }

        return this;
    }

    /**
     * Gets the maxinum number of records to be returned.
     * @return {int}
     */
    getLimit() {
        return this._limit;
    }

    /**
     * Sets the maxinum number of records to be returned.
     * @param {int} limit The maxinum of records to be returned.
     * @return {Query} the query object itself.
     */
    limit(limit) {
        this._limit = limit;
        return this;
    }

    /**
     * Gets the zero-based offset from where the records are to be returned.
     * @return {int}
     */
    getOffset() {
        return this._offset;
    }

    /**
     * Specify zero-based offset from where the records are to be returned.
     * @param {int} offset The zero-based offset from where the records are to be returned.
     * @return {Query} the query object itself.
     */
    offset(offset) {
        this._offset = offset;
        return this;
    }

    getWhere() {
        return this._where;
    }

    /**
     * Sets the WHERE part of query.
     *
     * The condition specified as an object(called hash format):
     * - **hash format: {'column1': value1, 'column2': value2, ...}**
     *
     * The condition specified as an array:
     * - **operator format: [operator1, operator2, ...]**
     *
     * A condition in hash format represents the following SQL expression in general:
     * column1=value1 AND column2=value2 AND ... .
     * In case when a value is an array, an IN expression will be generated.
     * And if a value is, IS NULL will be used in the generated expression.
     * Below are some examples:
     * - {'type': 1, 'status': 2} generates **(type = 1) AND (status = 2)**.
     * - {'id': [1, 2, 3], 'status': 2} generates **(type IN (1, 2, 3)) AND (status = 2)**.
     * - {'status': null} generates **status IS NULL**
     *
     * A condition in operator format generates the SQL expression according to the specified operator,
     * which can be one of the following:
     *
     * - **and**: the operands should be concatenated together using AND.
     * For example, **['and', 'id=1', 'id=2']** will generate **id=1 AND id=2**.
     * If an operand is an array, it will be converted into a string using rules
     * described here. For example, **['and', 'type=1', ['or', 'id=1', 'id=2']]** will
     * generate **type=1 AND (id=1 OR id=2)**. The method will not do any quoting or escaping
     *
     * - **or**: similar to the and operator except that the operands are concatenated using OR.
     * For example, **['or', {'type': [7, 8, 9]}, {'id': [1, 2, 3]}]** will generate
     * **(type in (7, 8, 9) OR (id in (1, 2, 3)))**.
     * @param {object|array} condition The conditions that should be put in the WHERE part.
     * @param {object} params the parameters (name: value) to be bound to the query.
     * @return {Query} the query object itself.
     */
    where(condition, option) {
        let arr = ['AND'];
        let link = 'AND';

        if (util.isEmpty(condition))
            return this;

        arr.push(condition[0]);

        if(typeof option != "undefined")
            link = option.toUpperCase();

        let itemArr;
        for(let i=1; i<condition.length; i++){
            itemArr = [link];
            itemArr = itemArr.concat(condition[i]);
            arr.push(itemArr);
        }
        this._where.push(arr);
        return this;
    }

    /**
     * Adds an additional WHERE condition to the existing one.
     * @param {object|array} condition The new condition, please refer to {@link Query#where where()} on
     * how to specify this parameter.
     * @param {object} params The parameters (name: value) to be bound to the query.
     * @return {Query} The query object itself.
     * @see {@link Query#where where()}
     * @see {@link Query#andWhere andWhere()}
     */
    orWhere(condition) {
        let arr = ['OR'];
        let link = 'AND';

        if (util.isEmpty(condition))
            return this;

        arr.push(condition[0]);

        let itemArr;
        for(let i=1; i<condition.length; i++){
            itemArr = [link];
            itemArr = itemArr.concat(condition[i]);
            arr.push(itemArr);
        }
        this._where.push(arr);
        return this;
    }

    getData() {
        return this._data;
    }

    getTable() {
        return this._table;
    }

    /**
     * Insert into database a new record.
     * @param {String} table The name of table.
     * @param {Object} data The key indicates field name and the value indicates the field's value.
     * @return {Query}
     */
    insert(table, data) {
        this._ctx = 'INSERT';
        this._table = table;
        this._data = data;
        return this;
    }

    /**
     * Insert into database a new record.
     * @param {String} table The name of table.
     * @param {Object} data The key indicates field name and the value indicates the field's value.
     * @return {Query}
     */
    update(table, data) {
        this._ctx = 'UPDATE';
        this._table = table;
        this._data = data;
        return this;
    }

    /**
     *  Set the context of the method get() to 'ALL' which means it will fetch all rows from database
     *  when execute the method get().
     * @returns {Query}
     */
    all() {
        this._ctx = 'ALL';
        return this;
    }

    /**
     *  Fetch all rows from database.
     * @returns {Promise} If success two dimensions array will be returned, otherwise an {Exception} will be throwed.
     * @throws Will throw an error if the statement is executed failed.
     */
    async get() {
        let sql = this.db.getBuilder().makeFetchSql(this);
        let ctx = this;
        return new Promise(function (resolve, reject) {
            ctx.db.read(sql, ctx.binds, function (err, results) {
                if(err) return reject(err);
                if(ctx._ctx == 'ALL'){
                    return resolve(results);
                }
            });
        });
    }

    /**
     * Execute sql statement.
     * You can call this method after you executed 'update()','insert()' or 'delete()' method.
     * @return {Promise}
     */
    async exe() {
        let sql = '';
        switch (this._ctx) {
           case 'UPDATE':
               break;
           case 'INSERT':
               sql = this.db.getBuilder().makeInsertSql(this);
               return this._insert(sql, this.binds);
               break;
           case 'DELETE':
               break;
       }
    }

    async _insert(sql, binds) {
        let ctx = this;
        return new Promise(function (resolve, reject) {
            ctx.db.insert(sql, binds, function (err, insertId) {
                if(err) return reject(err);
                return resolve(insertId);
            });
        });
    }

    toSql() {
        let sql = '';
        switch (this._ctx) {
            case 'ALL':
                sql = this.db.getBuilder().makeFetchSql(this);
                break;
            case 'UPDATE':
                break;
            case 'INSERT':
                sql = this.db.getBuilder().makeInsertSql(this);
                break;
            case 'DELETE':
                break;
        }
        return sql;
    }
}

module.exports = Query;