/**
 * Created by ldj on 2017/5/10.
 */
//导入所需模块
var mysql=require("mysql");


//导出查询相关
exports.query=function(pool, sql,callback){
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