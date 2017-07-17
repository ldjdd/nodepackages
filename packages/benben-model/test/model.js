/**
 * Created by ldj on 2017/6/13.
 */
var assert = require('assert');
var mysql = require('mysql');
var BaseModel = require('benben-model');

var db = {
    host:      'dbserver.xunmall.com',
    user:      'root',
    password:  'xm_123456',
    database:  'xm_log',
    port:      3306,
    tablePrefix: 'pre_'
};

db.pool = mysql.createPool({
    host:      exports.host,
    user:      exports.user,
    password:  exports.password,
    database:  exports.database,
    port:      exports.port
});


const model = new (class me extends BaseModel{
    get db(){
        return db;
    }

    get table(){
        return '{{member}}';
    }
})();

describe('model', function() {
    describe('#realTable', function() {
        it('should return af_member when the value is {{member}}', function() {
            assert.equal('pre_member', model.realTable);
        });
    });
});

