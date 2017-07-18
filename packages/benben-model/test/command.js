/**
 * Created by ldj on 2017/6/13.
 */
var assert = require('assert');
var command = require('../lib/command');
var mysql = require('mysql');
var co = require('co');

var db = {
    host:      'dbserver.xunmall.com',
    user:      'root',
    password:  'xm_123456',
    database:  'test_benben_model',
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

describe('command', function() {
    describe('#all', function() {
        it('result should be two-dimensional array', function() {
            co(function*() {
                var result = yield command.column(db, {
                        table: '{{orders}}'
                    }
                );
                assert.equal('2', result.length);
                assert.equal('123456', result[0]['order_id']);
                assert.equal('123457', result[1]['order_id']);
            });
        });
    });

    describe('#column', function() {
        it('result should be one-dimensional array', function() {
            co(function*() {
                var result = yield command.column(db, {
                        table: '{{orders}}',
                        select: 'order_id'
                    }
                );
                assert.equal('2', result.length);
                assert.equal('123456', result[0]);
                assert.equal('123457', result[1]);
            });
        });
    });

    describe('#makeQuerySql', function() {
        it('only table', function() {
            assert.equal('select * from {{orders}}', command.makeQuerySql(
                {
                    table: '{{orders}}',
                }
            ));
        });

        it('select', function() {
            assert.equal('select name, age from {{orders}}', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    select: 'name, age'
                }
            ));
        });

        it('order', function() {
            assert.equal('select name, age from {{orders}} order by age desc', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    select: 'name, age',
                    order: 'age desc'
                }
            ));
        });

        it('limit', function() {
            assert.equal('select * from {{orders}} limit 8', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    limit: 8
                }
            ));
        });

        it('offset limit', function() {
            assert.equal('select * from {{orders}} offset 10 limit 8', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    offset: 10,
                    limit: 8
                }
            ));
        });

        it('where', function() {
            assert.equal('select * from {{orders}} where order_id=123456', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    condition: 'order_id=123456'
                }
            ));

            assert.equal('select * from {{orders}} where order_id=\'123456\'', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    condition: {
                        order_id: 123456
                    }
                }
            ));

            assert.equal('select * from {{orders}} where order_id=\'123456\' and uid=\'100\'', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    condition: {
                        order_id: 123456,
                        uid: 100
                    }
                }
            ));
        });

        it('all', function() {
            assert.equal('select name,total from {{orders}} where order_id=\'123456\' and uid=\'100\' order by created_at desc offset 10 limit 8', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    select: 'name,total',
                    condition: {
                        order_id: 123456,
                        uid: 100
                    },
                    order: 'created_at desc',
                    offset: 10,
                    limit: 8
                }
            ));
        });
    });
});

