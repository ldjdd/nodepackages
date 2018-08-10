const Scheme = require('./MysqlScheme');

module.exports = {
    create(config) {
        return new Scheme(mysql.createPool({
            host:      config.host,
            user:      config.user,
            password:  config.password,
            database:  config.database,
            port:      config.port
        }));
    }
}
