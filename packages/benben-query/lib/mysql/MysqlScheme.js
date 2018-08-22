var mysql      = require('mysql');
var builder = new (require('../SqlBuilder'))();
const fs = require('fs');

/**
 * Class MysqlScheme
 */
class MysqlScheme{
    constructor(config) {
        this.pool = mysql.createPool({
            host:      config.host,
            user:      config.user,
            password:  config.password,
            database:  config.database,
            port:      config.port
        });
    }

    /**
     * @return {SqlBuilder}
     */
    getBuilder() {
        return builder;
    }

    /**
     * Execute a query statement.
     * @param {string} sql The query statement.
     * @param {array} binds The values of placeholds.
     * @return {void}
     */
    execute(sql, binds, callback) {
        let context = this;
        context.pool.getConnection(function(err, conn){
            if (err) {
                callback(err);
            } else {
                conn.query(sql, binds, function (err, results, fields) {
                    conn.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, results);
                    }
                });
            }
        });
    }

    /**
     * Execute a fetch statement.
     * @param sql
     * @param binds
     * @param {Callback} callback
     */
    read(sql, binds, callback){
        this.execute(sql, binds, function (err, results) {
            if(err){
                callback(err);
            } else {
                callback(null, results);
            }

        });
    }

    update(sql, binds, callback){
        this.execute(sql, binds, function (err, results) {
            if(err) {
                callback(err);
            } else {
                callback(null, results.changedRows);
            }
        });
    }

    insert(sql, binds, callback){
        this.execute(sql, binds, function (err, results) {
            if(err) {
                callback(err);
            } else {
                if(results.hasOwnProperty('insertId')) {
                    callback(null, results.insertId);
                } else {
                    callback(null, 0);
                }
            }
        });
    }

    delete(sql, binds, callback){
        this.execute(sql, binds, function (err, results) {
            if(err) {
                callback(err);
            } else {
                callback(null, results.affectedRows);
            }
        });
    }
}

module.exports = MysqlScheme;