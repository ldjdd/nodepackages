/**
 * Created by ldj on 2018/8/17.
 */

const mysql = require('./lib/mysql');
const Query = require('./lib/Query');

var configures = {};
var conns = {};

module.exports = {
    /**
     * Add a new database connection.
     * @param {String} id The identity of database connection.
     * @param {Object} config
     * @example
     * query.addConn('default', {
     *   type:      'mysql',
     *   host:      '127.0.0.1', // The type of database that you want to connect.For example 'mysql'.
     *   user:      'root',
     *   password:  '123456',
     *   database:  'test',
     *   port:      3306
     * });
     */
    conn(id, config) {
        configures[id] = config;
    },

    /**
     * Create a new Query object.
     * Because parameter db's default value is 'default',
     * so you don't need to pass the parameter db if you pass 'default'
     * to the parameter id when you call method addConn()
     * @param {String} db The identity of database connection, the default value is 'default'.
     * @return {Query}
     */
    query(db) {
        let conn = null;

        if(typeof(db) == 'undefined')
            db = 'default';

        if(!conns.hasOwnProperty(db)) {
            conn = this._createConn(db);
        }

        if(!conn) {
            return null;
        }

        return new Query(conn);
    },

    _createConn(db) {
        if(!configures.hasOwnProperty(db)){
            return null;
        }
        if(configures[db].type == 'mysql') {
            return mysql.create(configures[db]);
        }
    }
};