/**
 * Created by ldj on 2017/5/10.
 */
//导入所需模块
var mysql=require("mysql");

var _table;
var _fields;

function realTable(tablePre, table){
    return table.replace(/\{\{(.*)\}\}/g, tablePre + "$1");
}

function select(fields){
    _fields = '*';
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
/**
 *
 * @param condition
 * 'a=2'    // a=2
 * {a:2, b:3}   // a=2 and b=3
 * ['a=2']  // a=2
 * ['a=2 ', ['or', 'b=3']    // (a=2) or (b=3)
 * ['a=2', ['and','b=3'], ['or', 'c=4']  // (a=2 and b=3) or (c=4)
 * @returns string
 */
function conditionToStr(condition){
    var tmp = '';
    if(typeof condition == 'object')
    {
        for (let k in condition)
        {
            tmp += " and " + k + "='" + condition[k] + "'";
        }
        var d = tmp.substr(5);
        return d;
    }
    else if(typeof condition == 'string')
    {
        tmp = condition;
    }

    return tmp;
}

/**
 * @param {
 *  'table': '', // 表名
 *  'select': '', // 查询字段
 *  'order': '', // 排序
 *  'offset': 10, // 从第几天记录开始查找
 *  'limit': 8, // 返回记录数
 *  'condition': '', // 查询条件
 * }
 */
exports.makeQuerySql = function(params){
    var sql = 'select ' + select(params.select) + ' from ' + params.table;


    if (typeof params.condition != 'undefined') {
        sql += ' where ' + conditionToStr(params.condition);
    }

    if(typeof params.order != 'undefined'){
        sql += ' order by ' + params.order;
    }

    if(typeof params.offset != 'undefined'){
        sql += ' offset ' + params.offset;
    }

    if(typeof params.limit != 'undefined'){
        sql += ' limit ' + params.limit;
    }

    return sql;
};

exports.column = function(db, params, key){

    params.table = realTable(db.tablePrefix, params.table);
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
                    data.push(results[i][field]);
                }
            }
            else
            {
                data = {};
                for(let i=0; i<results.length; i++)
                {
                    data[results[i][key]] = results[i][field];
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

exports.insert=function(pool, sql, values, callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql, values, function(qerr,vals){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals);
            });
        }
    });
};

exports.update=function(pool, sql, values, callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql, values, function(qerr,vals){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals);
            });
        }
    });
};