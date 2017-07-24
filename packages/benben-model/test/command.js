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

    describe('#scalar', function() {
        it('result should be 123456', function() {
            co(function*() {
                assert.equal(123456, yield command.scalar(db, {
                    table: '{{orders}}',
                    select: 'order_id',
                    condition: {order_id: 123456}
                }));
            });
        });
    });

    describe('#insert', function() {
        it('result should be 1', function() {
            var insertData = {
                order_id: 123456,
                name: 'a'
            };
            co(function*() {
                var id = yield command.insert(db, {
                        table: '{{order_items}}',
                        values: insertData
                    }
                );

                var item =yield command.one(db, {
                    table: '{{order_items}}',
                    condition: {id: id}
                });

                assert.equal(insertData.order_id, item.order_id);
                assert.equal(insertData.name, item.name);
            });
        });
    });

    describe('#update', function() {
        it('result should be 1', function() {
            co(function*() {
                var oldAmount = yield command.scalar(db, {
                    table: '{{orders}}',
                    select: 'amount',
                    condition: {order_id: 123456}
                });
                var newAmount = oldAmount + 1;
                var affected = yield command.update(db, {
                        table: '{{orders}}',
                        values: {amount: newAmount},
                        condition: {order_id: 123456}
                    }
                );

                assert.equal('1', affected);
                assert.equal(newAmount, yield command.scalar(db, {
                    table: '{{orders}}',
                    select: 'amount',
                    condition: {order_id: 123456}
                }));
            });
        });
    });

    describe('#count', function() {
        it('result should be 2', function() {
            co(function*() {
                var num = yield command.count(db, {
                        table: '{{orders}}',
                        select: 'order_id'
                    }
                );
                assert.equal('2', num);
            });
        });

        it('result should be 1', function() {
            co(function*() {
                var num = yield command.count(db, {
                        table: '{{orders}}',
                        select: 'order_id',
                        condition: 'order_id=123456'
                    }
                );
                assert.equal('1', num);
            });
        });
    });

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

        it('groupBy', function() {
            assert.equal('select count(order_id) as num from {{orders}} group by uid', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    select: 'count(order_id) as num',
                    groupBy: 'uid'
                }
            ));
        });

        it('having', function() {
            assert.equal('select count(order_id) as num from {{orders}} group by uid having num > 2', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    select: 'count(order_id) as num',
                    groupBy: 'uid',
                    having: 'num > 2'
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

            assert.equal('select * from {{orders}} where (order_id=123456) and (uid=100)', command.makeQuerySql(
                {
                    table: '{{orders}}',
                    condition: [
                        'order_id=123456',
                        'uid=100'
                    ]
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

