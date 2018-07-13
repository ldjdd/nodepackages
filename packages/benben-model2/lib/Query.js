const util = require('./util');

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
const query = class Query{
    constructor(){
        this._from = '';
        this._select = [];
    }

    /**
     * Get the select value
     * @return {string|array}
     */
    getSelect(){
        return this._select;
    }

    /**
     * Sets the SELECT part of the query.
     * @example
     * var query = new Query();
     *
     * // columns as a string.
     * query.select("id, name");
     * // columns as an array.
     * query.select(['id', 'name']);
     * // prefix with table names and/or contain column aliases.
     * query.select("user.id AS user_id, user.name");
     * query.select(['user.id AS user_id', 'user.name']);
     * @param {string|array} columns The columns to be selected.
     * Columns can be specified in either a string (e.g. "id, name") or an array (e.g. ['id', 'name']).
     * Columns can be prefixed with table names (e.g. "user.id") and/or contain column aliases
     * (e.g. "user.id AS user_id"). The method will automatically quote the column names.
     * @return {Query} The query object itself.
     */
    select(columns) {
        if(util.isString(columns)) {
            columns = columns.split(/\s*,\s*/);
        }
        this._select = columns;
        return this;
    }

    /**
     * Adds more columns to the SELECT part of the query.
     *
     * Note, that if select() has not been specified before,
     * you should include * explicitly if you want to select all remaining columns too:
     * ```javascript
     * query.addSelect(["*", "CONCAT(first_name, ' ', last_name) AS full_name"]);
     * ```
     * @param {string|arary} columns The columns to add to the select.
     * See {@link Query#select select()} for more details about the format of this parameter.
     * @return {Query} The query object itself.
     * @see {@link Query#select select()}
     */
    addSelect(columns) {
        if(util.isString(columns)) {
            columns = columns.split(/\s*,\s*/);
        }
        this._select = this._select.concat(columns);
        return this;
    }

    /**
     * Gets the FROM part of query
     * @return {string}
     */
    getFrom() {
        return this._from;
    }

    /**
     * Sets the FROM part of query.
     * @param {string} table The table to be selected from.
     * The method will automatically quote the table name.
     * @return {Query} The query object itself
     * @example
     * query.from('user');
     * // Set alias for table
     * query.from('user AS u');
     */
    from (table) {
        let arr = table.split(/\s*AS\s*/);

        this._from = table;
    }

    /**
     * Sets the ORDER BY part of query
     * @param {string|array} columns The columns to be ordered by.
     *
     * Columns can be specified in either a string (e.g. `"id ASC, name DESC"`)
     * or an object (e.g. `{'id': 'ASC', 'name': 'DESC'}`).
     * @return {Query} The query object itself
     */
    orderBy (columns) {
        this._orderBy = columns;
        return this;
    }

    /**
     * Adds additional ORDER BY columns to the query.
     * @param {string|array} columns The columns to be ordered by.
     * See {@link Query#orderBy orderBy()} for more details about the format of this parameter.
     * @return {Query} The query object itself
     * @see {@link Query#orderBy orderBy()}
     */
    addOrderBy (columns) {
        return this;
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
     * In case when when a value is an array, an IN expression will be generated.
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
     * @param {string|object} condition the conditions that should be put in the WHERE part.
     * @param {object} params the parameters (name: value) to be bound to the query.
     * @return {Query} the query object itself.
     */
    where(condition, params) {

    }
}

module.exports = query;