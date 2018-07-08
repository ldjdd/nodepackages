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
    constructor(){
        this._table = '';
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
     * // prefix with table names and contain column aliases.
     * query.select("user.id AS user_id, user.name");
     * @param {string|array} columns The columns to be selected.
     * Columns can be specified in either a string (e.g. "id, name")
     * or an array (e.g. ['id', 'name']). Columns can be prefixed with
     * table names (e.g. "user.id") and/or contain column aliases
     * (e.g. "user.id AS user_id"). The method will automatically
     * quote the column names.
     * @return {Query} The query object itself.
     */
    select(columns) {
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
        return this;
    }

    /**
     * Gets the table name
     * @readonly
     * @return {string}
     */
    get table() {
        return this._table;
    }

    /**
     * Sets the FROM part of query.
     * @param {string} table The table to be selected from.
     * The method will automatically quote the table name.
     * @return {Query} The query object itself
     */
    from (table) {
        this._table = table;
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
}
