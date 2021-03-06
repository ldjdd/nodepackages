/**
 * Created by ldj on 2017/5/10.
 */
//导入所需模块
var mysql=require("mysql");

function realTable(tablePre, table){
    return table.replace(/\{\{(.*)\}\}/g, tablePre + "$1");
}

function select(fields){
    var _fields = '*';
    if (typeof fields === 'array')
    {
        _fields = fields.join(',');
    }
    else if(typeof fields === 'string')
    {
        _fields = fields;
    }
    return _fields;
}

function objectToCondition(conn, object){
    let tmp = '';

    for (let k in object)
    {
        tmp += " and " + k + "=" + conn.escape(object[k]);
    }

    if(tmp !== '')
    {
        return tmp.substr(5);
    }

    return '';
}

function strToCondition(str) {
    return str;
}

function arrayToCondition(conn, arr){
    var str = '';
    if(typeof arr[1] == 'string')
    {
        str = strToCondition(arr[1]);
    }
    else if(typeof arr[1] == 'object')
    {
        str = objectToCondition(conn, arr[1]);
    }
    return arr[0] + ' (' + str + ')';
}

/**
 * @param condition {Object} <pre>
 * 'a=2'    // a=2
 * {a:2, b:3}   // a=2 and b=3
 * ['a=2']  // a=2
 * ['a=2', {b:3}]   // a=2 and b=3
 * ['a=2', 'b=3']   // a=2 and b=3
 * ['a=2 ', ['or', 'b=3']    // (a=2) or (b=3)
 * ['a=2', ['and','b=3'], ['or', 'c=4']  // (a=2 and b=3) or (c=4)
 * </pre>
 * @returns string
 */
function conditionToStr(conn, condition){
    var str = '';

    if(!Array.isArray(condition))
    {
        condition = [condition];
    }

    for(let i=0; i<condition.length; i++)
    {
        if(typeof condition[i] == 'string')
        {
            if(str.length === 0)
                str = strToCondition(condition[i]);
            else
                str = '(' + str + ') and (' + strToCondition(condition[i]) + ')';
        }
        else if(Array.isArray(condition[i]))
        {
            if(str.length === 0)
            {
                str = arrayToCondition(conn, condition[i]);
                str = str.substr(str.indexOf(' ') + 1);
            }
            else
            {
                str =  '(' + str + ') ' + arrayToCondition(conn, condition[i]);
            }
        }
        else if(typeof condition[i] == 'object')
        {
            if(str.length === 0)
                str = objectToCondition(conn, condition[i]);
            else
                str =  '(' + str + ') and (' + objectToCondition(conn, condition[i]) + ')';
        }
    }

    return str;
}

/**
 * Generates query sql statement.
 *
 * The params specified as an Object
 *
 * @param conn {Connection} - The database connection
 * @param params {Object}
 * - 'table': 'table', // The table to be queried.
 * - 'select': 'a,b', // The fields to be fetched.
 * - 'groupBy': 'a', {String|Array}// How to group the query results.
 * - 'having': '',   // The condition to be applied in the GROUP BY clause.
 * - 'order': 'a desc', // Sets the ORDER BY part of the query.
 * - 'offset': 10, // Sets the OFFSET part of the query.
 * - 'limit': 8, // Sets the LIMIT part of the query.
 * - 'condition': '', // Sets the WHERE part of the query.
 * @return String
 */
exports.makeQuerySql = function(conn, params){
    var sql = 'select ' + select(params.select) + ' from ' + params.table;

    /*var pa=[{
        table: '',
        alias: '',
        on: '',
        type: 'left'
    }];*/

    if(typeof params.join != 'undefined' && Array.isArray(params.join)){
        sql += ' as t';
        for(let i=0; i<params.join.length; i++){
            sql += ' ' + (params.join[i].type || 'left') + ' join ' + params.join[i].table + (params.join[i].alias ? ' as ' + params.join[i].alias : '')
                + ' on ' + params.join[i].on;
        }
    }

    if (typeof params.condition != 'undefined' && params.condition != '') {
        sql += ' where ' + conditionToStr(conn, params.condition);
    }

    if(typeof params.groupBy != 'undefined' && params.groupBy.length > 0){
        sql += ' group by ' + params.groupBy;
    }

    if(typeof params.having != 'undefined' && params.having.length > 0){
        sql += ' having ' + params.having;
    }

    if(typeof params.order != 'undefined' && params.order.length > 0){
        sql += ' order by ' + params.order;
    }

    if(typeof params.limit != 'undefined' && params.limit > 0){
        sql += ' limit ' + params.limit;
    }

    if(typeof params.offset != 'undefined' && params.offset > 0){
        sql += ' offset ' + params.offset;
    }

    return sql;
};

/**
 * Get a sql for update
 * @param params {Object} <pre>{
 *  'table': '', // the name of table
 *  'values': '', // this is a map that field is key and set field to the value
 *  'condition': '', //  query condition
 * }</pre>
 * @return string
 */
exports.makeUpdateSql = function(conn, params){
    var sql = 'update ' + params.table + ' set ?';

    if (typeof params.condition != 'undefined' && params.condition != '') {
        sql += ' where ' + conditionToStr(conn, params.condition);
    }

    if(typeof params.limit != 'undefined' && params.limit > 0){
        sql += ' limit ' + params.limit;
    }

    return sql;
};

/**
 * Get a sql for delete
 * @param params {Object} <pre>{
 *  'table': '', // the name of table
 *  'condition': '', //  query condition
 * }</pre>
 * @return string
 */
exports.makeDeleteSql = function(conn, params){
    var sql = 'delete from ' + params.table;

    if (typeof params.condition != 'undefined' && params.condition != '') {
        sql += ' where ' + conditionToStr(conn, params.condition);
        if(typeof params.limit != 'undefined' && params.limit > 0){
            sql += ' limit ' + params.limit;
        }

        return sql;
    }else{
        throw 'Delete expects condition';
    }
};

/**
 * Get a one-dimensional result.
 *
 * @param db
 * @param params {Object} {
 *  table: '',   // The name of table
 *  select: '', // It can't be empty and must be a single field
 *  condition: '', // Query condition
 * }
 * @param key If set the param the result will be return a map that key is row[key](if variable row is row of results) else the result will be array
 * @returns {Promise}
 */
exports.column = function(db, params, key){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                params.table = realTable(db.tablePrefix, params.table);
                var sql =  exports.makeQuerySql(conn, params);

                exports.query(conn, sql, function (error, results, fields) {
                    if (error) return reject(error);

                    let data;

                    if(typeof key == 'undefined')
                    {
                        data = [];
                        for(let i=0; i<results.length; i++)
                        {
                            data.push(results[i][fields[0]['name']]);
                        }
                    }
                    else
                    {
                        data = {};
                        for(let i=0; i<results.length; i++)
                        {
                            data[results[i][key]] = results[i][fields[0]['name']];
                        }
                    }

                    return resolve(data);
                });
            }
        });
    });
};

exports.all = function(db, params, key){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                params.table = realTable(db.tablePrefix, params.table);
                var sql =  exports.makeQuerySql(conn, params);

                exports.query(conn, sql, function (error, results, fields) {
                    if (error) return reject(error);

                    if(typeof(key) == 'string')
                    {
                        let data = {};
                        for(let k=0; k<results.length; k++)
                        {
                            data[results[k][key]] = results[k];
                        }
                        return resolve(data);
                    }
                    return resolve(results);
                });
            }
        });
    });
}

exports.one = function(db, params){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                params.table = realTable(db.tablePrefix, params.table);
                params.limit = 1;
                var sql =  exports.makeQuerySql(conn, params);

                exports.query(conn, sql, function (error, results, fields) {
                    if (error) return reject(error);

                    if(results.length === 1){
                        return resolve(results[0]);
                    }
                    return resolve([]);
                });
            }
        });
    });
}

/**
 * Returns the query result as a scalar value.
 * @param db {Connection} The database connection used to generate the SQL statement.
 * @param params {Object}
 *  table: '',   // The name of table
 *  select: '', // It can't be empty and must be a single field
 *  condition: '', // Query condition
 * }{@link query} for further information.
 * @returns {Promise}
 */
exports.scalar = function(db, params){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                params.table = realTable(db.tablePrefix, params.table);
                params.limit = 1;
                var sql =  exports.makeQuerySql(conn, params);

                exports.query(conn, sql, function (error, results, fields) {
                    if (error) return reject(error);

                    if(results.length === 1){
                        return resolve(results[0][fields[0]['name']]);
                    }
                    return resolve(null);
                });
            }
        });
    });
}

exports.count = function(db, params){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                params.table = realTable(db.tablePrefix, params.table);
                params.limit = 1;
                if(typeof params.fields != 'undefined' && params.fields.length > 0)
                    params.select = 'count(' + params.fields + ') as _num_';
                else
                    params.select = 'count(*) as _num_';
                var sql =  exports.makeQuerySql(conn, params);

                exports.query(conn, sql, function (error, results, fields) {
                    if (error) return reject(error);

                    if(results.length === 1){
                        return resolve(results[0]['_num_']);
                    }
                    return resolve(0);
                });
            }
        });
    });
}

//导出查询相关
exports.query = function(conn, sql,callback){
    conn.query(sql,function(qerr,vals,fields){
        //释放连接
        conn.release();
        //事件驱动回调
        callback(qerr,vals,fields);
    });
};

exports.insert = function(db, params){
    var sql = 'INSERT INTO ' + realTable(db.tablePrefix, params.table) + ' SET ?';
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function (err, conn) {
            if (err)
            {
                return reject(err);
            }
            else
            {
                conn.query(sql, params.values, function (qerr, vals) {
                    //释放连接
                    conn.release();

                    if(qerr)
                    {
                        return reject(qerr);
                    }
                    return resolve(vals.insertId);
                });
            }
        });
    });
};

exports.update = function(db, params){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if (err)
            {
                return reject(err);
            }
            else
            {
                params.table = realTable(db.tablePrefix, params.table);
                var sql = exports.makeUpdateSql(conn, params);
                conn.query(sql, params.values, function (qerr, vals) {
                    //释放连接
                    conn.release();

                    if(qerr)
                    {
                        return reject(qerr);
                    }
                    return resolve(vals.affectedRows);
                });
            }
        });
    });
};

exports.delete = function(db, params){
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
            if (err)
            {
                return reject(err);
            }
            else
            {
                params.table = realTable(db.tablePrefix, params.table);
                var sql = exports.makeDeleteSql(conn, params);
                conn.query(sql, params.values, function (qerr, vals) {
                    //释放连接
                    conn.release();

                    if(qerr)
                    {
                        return reject(qerr);
                    }
                    return resolve(vals.affectedRows);
                });
            }
        });
    });
};