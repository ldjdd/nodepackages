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

function objectToCondition(object){
    let tmp = '';

    for (let k in object)
    {
        tmp += " and " + k + "='" + object[k] + "'";
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

function arrayToCondition(arr){
    var str = '';
    if(typeof arr[1] == 'string')
    {
        str = strToCondition(arr[1]);
    }
    else if(typeof arr[1] == 'object')
    {
        str = objectToCondition(arr[1]);
    }
    return arr[0] + ' (' + str + ')';
}

/**
 *
 * @param condition
 * 'a=2'    // a=2
 * {a:2, b:3}   // a=2 and b=3
 * ['a=2']  // a=2
 * ['a=2', {b:3}]   // a=2 and b=3
 * ['a=2', 'b=3']   // a=2 and b=3
 * ['a=2 ', ['or', 'b=3']    // (a=2) or (b=3)
 * ['a=2', ['and','b=3'], ['or', 'c=4']  // (a=2 and b=3) or (c=4)
 * @returns string
 */
function conditionToStr(condition){
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
                str = arrayToCondition(condition[i]);
                str = str.substr(str.indexOf(' ') + 1);
            }
            else
            {
                str =  '(' + str + ') ' + arrayToCondition(condition[i]);
            }
        }
        else if(typeof condition[i] == 'object')
        {
            if(str.length === 0)
                str = objectToCondition(condition[i]);
            else
                str =  '(' + str + ') and (' + objectToCondition(condition[i]) + ')';
        }
    }

    return str;
}

/**
 * @param {
 *  'table': '', // 表名
 *  'select': '', // 查询字段
 *  'groupBy': '',
 *  'having': '',
 *  'order': '', // 排序
 *  'offset': 10, // 从第几天记录开始查找
 *  'limit': 8, // 返回记录数
 *  'condition': '', // 查询条件
 * }
 */
exports.makeQuerySql = function(params){
    var sql = 'select ' + select(params.select) + ' from ' + params.table;


    if (typeof params.condition != 'undefined' && params.condition != '') {
        sql += ' where ' + conditionToStr(params.condition);
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

    if(typeof params.offset != 'undefined' && params.offset > 0){
        sql += ' offset ' + params.offset;
    }

    if(typeof params.limit != 'undefined' && params.limit > 0){
        sql += ' limit ' + params.limit;
    }

    return sql;
};

/**
 * Get a sql for update
 * @param {
 *  'table': '', // the name of table
 *  'values': '', // this is a map that field is key and set field to the value
 *  'condition': '', //  query condition
 * }
 * @return string
 */
exports.makeUpdateSql = function(params){
    var sql = 'update ' + params.table + ' set ?';

    if (typeof params.condition != 'undefined' && params.condition != '') {
        sql += ' where ' + conditionToStr(params.condition);
    }

    if(typeof params.limit != 'undefined' && params.limit > 0){
        sql += ' limit ' + params.limit;
    }

    return sql;
};

/**
 * Get a one-dimensional result.
 *
 * @param db
 * @param params {
 *  table: '',   // The name of table
 *  select: '', // It can't be empty and must be a single field
 *  condition: '', // Query condition
 * }
 * @param key If set the param the result will be return a map that key is row[key](if variable row is row of results) else the result will be array
 * @returns {Promise}
 */
exports.column = function(db, params, key){
    params.table = realTable(db.tablePrefix, params.table);
    if(typeof key != 'undefined')
        params.select += ',' + key;
    var sql =  exports.makeQuerySql(params);

    return new Promise(function (resolve, reject) {

        exports.query(db.pool, sql, function (error, results, fields) {
            if (error)
            {
                return reject(error);
            }

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

    });
};

exports.all = function(db, params, key){
    params.table = realTable(db.tablePrefix, params.table);
    var sql =  exports.makeQuerySql(params);

    return new Promise(function (resolve, reject) {

        exports.query(db.pool, sql, function (error, results, fields) {
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
    });
}

exports.one = function(db, params){
    params.table = realTable(db.tablePrefix, params.table);
    params.limit = 1;
    var sql =  exports.makeQuerySql(params);

    return new Promise(function (resolve, reject) {

        exports.query(db.pool, sql, function (error, results, fields) {
            if (error)
            {
                return reject(error);
            }
            return resolve(results[0]);
        });

    });
}

exports.scalar = function(db, params){
    params.table = realTable(db.tablePrefix, params.table);
    params.limit = 1;
    var sql =  exports.makeQuerySql(params);

    return new Promise(function (resolve, reject) {

        exports.query(db.pool, sql, function (error, results, fields) {
            if (error)
            {
                return reject(error);
            }
            return resolve(results[0][fields[0]['name']]);
        });

    });
}

exports.count = function(db, params){
    params.table = realTable(db.tablePrefix, params.table);
    params.limit = 1;
    if(typeof params.fields != 'undefined' && params.fields.length > 0)
        params.select = 'count(' + params.fields + ') as _num_';
    else
        params.select = 'count(*) as _num_';

    var sql =  exports.makeQuerySql(params);

    return new Promise(function (resolve, reject) {

        exports.query(db.pool, sql, function (error, results, fields) {
            if (error)
            {
                return reject(error);
            }
            return resolve(results[0]['_num_']);
        });

    });
}

//导出查询相关
exports.query = function(pool, sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals,fields);
            });
        }
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
    params.table = realTable(db.tablePrefix, params.table);
    var sql = exports.makeUpdateSql(params);
    return new Promise(function (resolve, reject) {
        db.pool.getConnection(function(err,conn){
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
                    return resolve(vals.affectedRows);
                });
            }
        });
    });
};