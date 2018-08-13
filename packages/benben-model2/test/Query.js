const assert = require('assert');
const Query = require('../lib/Query');
const _ = require('lodash');
const mysql = require('../lib/mysql');
const db = mysql.create({
    host:      '127.0.0.1',
    user:      'root',
    password:  '123456',
    database:  'test',
    port:      3306
})

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
            assert.equal(_.isEqual(query.orderBy('id', 'DESC').getOrderBy(), [['id', 'DESC']]), true);
            assert.equal(_.isEqual(query.orderBy('coin', 'ASC').getOrderBy(), [['id', 'DESC'], ['coin', 'ASC']]), true);
        });
    });
    describe('#where()', function() {
        it('This condition use `and` link with before sibling', function() {
            let query = new Query();

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

    describe('#toSql()', function() {
        it('Insert new records into database', function() {
            let query = new Query(db);

            let sql = query.insert('pre_test', {
                a: 1,
                b: 2,
                c: 'c',
                d: '中文'
            }).toSql();

            assert.equal(sql, 'INSERT `pre_test` (`a`,`b`,`c`,`d`) VALUES (?,?,?,?)');
        });
    });

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
                .all()
                .get();

            return assert.equal(rows.length > 10, true);
        });
    });

    describe('#insert()', function() {
        it('Insert new record into database', async function() {
            let query = new Query(db);

            let id = await query.insert('pre_test', {
                a: 1,
                b: 2,
                c: 'c',
                d: '中文'
            }).exe();
            return assert.equal(id > 15, true);
        });
    });

    /*describe('#update()', function() {
        it('Update records', async function() {
            let query = new Query(db);

            let id = await query.update('pre_test', {
                a: 1,
                b: 2,
                c: 'c',
                d: '中文'
            }).exe();
            return assert.equal(id > 15, true);
        });
    });*/
});