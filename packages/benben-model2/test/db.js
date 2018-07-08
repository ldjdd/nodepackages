var connection = new (require('../lib/Connection.js'))(
    {
        host:      '127.0.0.1',
        user:      'root',
        password:  '123456',
        database:  'test_benben_model',
        port:      3306,
        tablePrefix: 'pre_'
    }
);

module.exports = db;