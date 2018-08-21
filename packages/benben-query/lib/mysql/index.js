const Scheme = require('./MysqlScheme');
const mysql = require('mysql');

module.exports = {
    create(config) {
        return new Scheme(config);
    }
}
