var mysql = require('mysql');

/**
 * @property {Scheme} scheme
 */
const me = class Connection {
    /**
     * Create a connection
     * @param config {Object} <pre>{
     *       host:      '127.0.0.1',
     *       user:      'root',
     *       password:  '123456',
     *       database:  'test_benben_model',
     *       port:      3306,
     *      tablePrefix: 'pre_'
     *  }</pre>
     */
    constructor(config) {
        this.scheme = null;
        this.config = config;
        this.pool = mysql.createPool({
            host:      this.config.host,
            user:      this.config.user,
            password:  this.config.password,
            database:  this.config.database,
            port:      this.config.port
        });
    }

    setScheme(scheme) {
        this.scheme = scheme;
    }

    getBuilder() {

    }
}

module.exports = me;