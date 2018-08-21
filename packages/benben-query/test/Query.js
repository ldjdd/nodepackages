const assert = require('assert');
const Query = require('../lib/Query');
const _ = require('lodash');
const mysql = require('../lib/mysql/index');
const bb = require('../index');
const db = mysql.create({
    host:      '127.0.0.1',
    user:      'root',
    password:  '123456',
    database:  'test',
    port:      3306
});
bb.conn('default', {
    type: 'mysql',
    host:      '127.0.0.1',
    user:      'root',
    password:  '123456',
    database:  'test',
    port:      3306
});

describe('Query', function() {
    describe('#select()', function() {
        let query = new Query();
        it('should return [\'id\', \'name\'] or \'id, name\' when pass \'id, name\'', function() {
            query.select(['id', 'name']);
            assert.equal(_.isEqual(query.getSelect(), ['id', 'name']), true);
        });
    });
    describe('#addSelect()', function() {
        it('should return true when pass a string, false otherwise', function() {
            let query = new Query();
            assert.equal(_.isEqual(query.select('id')
                .select(['name'])
                .select(['token'])
                .getSelect(),
                ['id', 'name', 'token']), true);
        });
    });
    describe('#from()', function() {
        it('should return true when pass a string, false otherwise', function() {
            let query = new Query();
            assert.equal(query.from('user').getFrom(), 'user');
        });
    });
    describe('#orderBy()', function() {
        it('should return true when pass a string, false otherwise', function() {
            let query = new Query();
            assert.equal(_.isEqual(query.orderBy('id DESC, coin ASC').getOrderBy(), [['id', 'DESC'], ['coin', 'ASC']]), true);
        });
    });
    describe('#groupBy()', function() {
        it('should return true when pass a string, false otherwise', function() {
            let query = new Query();
            assert.equal(_.isEqual(query.groupBy('id, name').getGroupBy(), ['id', 'name']), true);
        });
    });
    describe('#where()', function() {
        it('This condition use `and` link with before sibling', function() {
            let query = new Query();

            query.where('a', 100);
            query.where('b', [1, 2, 3]);
            assert.equal(JSON.stringify(query.getWhere()), JSON.stringify([
                [ 'AND', ['a', '=', 100] ],
                [ 'AND', ['b', 'IN', [1, 2, 3]] ]
            ]));

            query = new Query();

            query.where([
                ['a', '=', 1],
                ['b', '=', 2],
            ]);

            assert.equal(JSON.stringify(query.getWhere()), JSON.stringify([
                [ 'AND', ['a', '=', 1], ['AND', 'b', '=', 2] ]
            ]));

            query.where([
                ['c', '=', 3],
                ['d', '=', 4]
            ], 'or');

            assert.equal(JSON.stringify(query.getWhere()), JSON.stringify([
                [ 'AND', ['a', '=', 1], ['AND', 'b', '=', 2] ],
                [ 'AND', ['c', '=', 3], ['OR', 'd', '=', 4] ],
            ]));
        });
    });

    describe('#orWhere()', function() {
        it('This condition use `or` link with before sibling', function() {
            let query = new Query();

            query.where([
                ['a', '=', 1],
                ['b', '=', 2],
            ]).orWhere([
                ['c', '=', 3],
                ['d', '=', 4]
            ]);

            assert.equal(JSON.stringify(query.getWhere()), JSON.stringify([
                [ 'AND', ['a', '=', 1], ['AND', 'b', '=', 2] ],
                [ 'OR', ['c', '=', 3], ['AND', 'd', '=', 4] ],
            ]));
        });
    });

    /*describe('#toSql()', function() {
        it('Insert new records into database', async function() {
            let query = new Query(db);

            let sql = await query.table('pre_test').data({
                a: 1,
                b: 2,
                c: 'c',
                d: '中文'
            }).toSql();

            assert.equal(sql, 'INSERT `pre_test` (`a`,`b`,`c`,`d`) VALUES (?,?,?,?)');
        });
    });*/

    describe('#all()', function() {
        it('Fetch all rows from database', async function() {
            let query = new Query(db);

            let rows = await query.from('pre_test').where([
                    ['a', '=', 1],
                    ['b', '=', 2],
                ])
                .orWhere([
                    ['c', '=', 3],
                    ['d', '=', 4]
                ])
                .groupBy('a, b, c, d')
                .all();

            return assert.equal(rows.length, 3);
        });

        it('BETWEEN', async function() {
            let query = new Query(db);

            let rows = await query.from('pre_test')
                .where('id', 'BETWEEN', 10, 20)
                .all();

            return assert.equal(rows.length, 11);
        });

        it('LIKE', async function() {
            let query = new Query(db);

            let rows = await query.from('pre_test')
                .where('c', 'LIKE', '%cc%')
                .all();

            return assert.equal(rows.length, 2);
        });
    });

    describe('#one()', function() {
        it('Fetch one row from database', async function() {
            let query = new Query(db);
            let row = await query.from('pre_test')
                .where([
                    ['id', '=', 1],
                ])
                .one();

            assert.equal(JSON.stringify(row), JSON.stringify({id:1, a:'11', b:22, c:'cc', d:'中文中文'}));
        });
    });

    describe('#scalar()', function() {
        it('Fetch one scalar value', async function() {
            let query = new Query(db);
            let scalar = await query.from('pre_test')
                .where([
                    ['id', '=', 5],
                ])
                .scalar('d');

            assert.equal(scalar, '中文');
        });
    });

    describe('#insert()', function() {
        it('Insert new record into database', async function() {
            let query = bb.query();

            let id = await query.table('pre_test').data({
                a: 1,
                b: 2,
                c: 'c',
                d: '中文'
            }).insert();
            assert.equal(id > 15, true);
        });
    });

    describe('#update()', function() {
        it('Update records', async function() {
            let query = new Query(db);
            let changedRows = await query
                .table('pre_test')
                .data({
                    a: 11,
                    b: 22,
                    c: 'cc',
                    d: '中文中文'
                })
                .where([['id', '=', 1]])
                .update();
            assert.equal(changedRows, 0);
        });
    });

    describe('#delete()', function() {
        it('Delete records', async function() {
            let query = new Query(db);
            let affectedRows = await query.from('pre_test')
                .orderBy('id', 'DESC')
                .limit(1)
                .where([['id', 'IN', [2, 3, 4]]])
                .delete();
            assert.equal(affectedRows, 0);
        });
    });
});