var mysql      = require('mysql');
var builder = require('../SqlBuilder');

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
     * @return {Promise}
     */
    execute(sql, binds) {
        return new Promise(function (resolve, reject) {
            this.pool.getConnection(function(err, conn){
                if (error) return reject(err);
                conn.query(sql, binds, function (err, results, fields) {
                    if (error) return reject(err);
                    return resolve(results);
                });
            });
        });
    }

    /**
     * Execute a fetch statement.
     * @param sql
     * @param binds
     * @return {Promise}
     */
    read(sql, binds){
        return this.execute(sql, binds);
    }

    update(){

    }

    delete(){

    }

    insert(){

    }
}