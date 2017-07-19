/**
 * Created by ldj on 2017/6/13.
 */
var assert = require('assert');
var mysql = require('mysql');
var co = require('co');
var BaseModel = require('../index');

var db = {
    host:      'dbserver.xunmall.com',
    user:      'root',
    password:  'xm_123456',
    database:  'xm_log',
    port:      3306,
    tablePrefix: 'pre_'
};

db.pool = mysql.createPool({
    host:      db.host,
    user:      db.user,
    password:  db.password,
    database:  db.database,
    port:      db.port
});


const model = new (class me extends BaseModel{
    get db(){
        return db;
    }

    get table(){
        return '{{orders}}';
    }
})();

describe('model', function() {
    describe('#realTable', function() {
        it('should return pre_orders when the value is {{orders}}', function() {
            assert.equal('pre_orders', model.realTable);
        });
    });

    describe('#all', function() {
        it('result should be two-dimensional array', function() {
            co(function*() {
                var result = yield model.all(db, 'order_id');
                assert.equal('123456', result['123456']['order_id']);
                assert.equal('123457', result['123457']['order_id']);
            });
        });
    });

    describe('#column', function() {
        it('result should be one-dimensional array', function() {
            co(function*() {
                var result = yield model.column(db, {
                        table: 'orders',
                        select: 'order_id'
                    }
                );
                assert.equal('2', result.length);
                assert.equal('123456', result[0]);
                assert.equal('123457', result[1]);
            });
        });
    });
});

