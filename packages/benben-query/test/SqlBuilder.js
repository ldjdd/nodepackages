const assert=require('assert');
const SqlBuilder=require('../lib/SqlBuilder');
const util=require('../lib/util');
const Query=require('../lib/Query');
const fs = require('fs');

describe('QueryBuiler', function() {
    describe('#quoteColumnName()', function() {
        const builder=new SqlBuilder();
        it('should return `id` when the name is \'id\'', function() {
            assert.equal(builder.quoteColumnName('id'), '`id`');
        });
        it('should return `id` when the name is `id`', function() {
            assert.equal(builder.quoteColumnName('id'), '`id`');
        });
        it('should return `user`.`id` when the name is \'user.id\'', function() {
            assert.equal(builder.quoteColumnName('user.id'), '`user`.`id`');
        });
        it('should return `user`.`id` when the name is \'user.`id`\'', function() {
            assert.equal(builder.quoteColumnName('user.`id`'), '`user`.`id`');
        });
        it('should return `user`.`id` when the name is \'`user`.id\'', function() {
            assert.equal(builder.quoteColumnName('`user`.id'), '`user`.`id`');
        });
        it('should return `user`.`id` when the name is \'`user`.`id`\'', function() {
            assert.equal(builder.quoteColumnName('`user`.`id`'), '`user`.`id`');
        });
        it('should return SUM(`coin`) when the name is \'SUM(coin)\'', function() {
            assert.equal(builder.quoteColumnName('SUM(t.coin)'), 'SUM(`t`.`coin`)');
        });
    });

    describe('#quoteTable()', function() {
        const builder=new SqlBuilder();
        it('should return `user` when pass \'user\'', function() {
            assert.equal(builder.quoteTable('user'), '`user`');
        });
        it('should return `user` when pass \'user AS u\'', function() {
            assert.equal(builder.quoteTable('user AS u'), '`user` AS `u`');
        });
        it('should return `user` when pass \'db.user AS u\'', function() {
            assert.equal(builder.quoteTable('db.user AS u'), '`db`.`user` AS `u`');
        });
    });

    describe('#buildGroupBy()', function() {
        const builder=new SqlBuilder();
        it('should return \'GROUP BY `id`, `name`\' when pass \'id, name\'', function() {
            assert.equal(builder.buildGroupBy(['id', 'name']), 'GROUP BY `id`, `name`');
        });
    });

    describe('#buildSelect()', function() {
        const builder=new SqlBuilder();
        it('should return \'SELECT `id`, `name`\' when the column is [\'id\', \'name\']', function() {
            assert.equal(builder.buildSelect(['id', 'name']), 'SELECT `id`, `name`');
        });
        it('should return \'SELECT `id`, `name`\' when the column is [\'user.id\', \'user_id\'], \'name\']', function() {
            // assert.equal(builder.buildSelect([['user.id', 'user_id'], 'name']]), 'SELECT `user`.`id` AS `user_id`, `name`');
            assert.equal(builder.buildSelect(['user.id AS user_id', 'name']), 'SELECT `user`.`id` AS `user_id`, `name`');
        });
        it('should return \'SELECT DISTINCT `id`, `name`\'', function() {
            assert.equal(builder.buildSelect(['id', 'name'], true), 'SELECT DISTINCT `id`, `name`');
        });
        it('should return SELECT MAX(`score`)', function() {
            assert.equal(builder.buildSelect(['MAX(score)']), 'SELECT MAX(score)');
        });
    });

    describe('#buildFrom()', function() {
        const builder=new SqlBuilder();
        it('should return \'user\' when the column is \'`user`\'', function() {
            assert.equal(builder.buildFrom('user'), 'FROM `user`');
        });
        it('should return \'`user` AS `u`\' when the column is [\'user\', \'u\']', function() {
            assert.equal(builder.buildFrom('user as u'), 'FROM `user` AS `u`');
        });
    });

    describe('#join()', function() {
        const builder=new SqlBuilder();
        it('join one table', function() {
            assert.equal(builder.buildJoin([['LEFT JOIN', 'post', 'user.id=post.id']]), 'LEFT JOIN `post` ON user.id=post.id');
            // assert.equal(builder.buildJoin([['LEFT JOIN', 'post', 'user.id=post.id']]), 'LEFT JOIN `post` ON `user`.`id`=`post`.`id`');
        });
    });

    describe('#buildCondition()', function() {
        const builder=new SqlBuilder();

        it('operator: =', function() {
            let query = new Query();
            query.where('a', 2).where('b', '=', 3);
            assert.equal(builder.buildCondition(query), 'WHERE (`a`=?) AND (`b`=?)');
        });

        it('operator: IN', function() {
            let query = new Query();
            query.where('a', [1, 2, 3]).where('b', 'IN', [3, 4, 5]);
            assert.equal(builder.buildCondition(query), 'WHERE (`a` IN (?)) AND (`b` IN (?))');
        });

        it('operator: >, >=, <, <=', function() {
            let query = new Query();
            query.where('a', '>', 2)
                .where('b', '>=', 3)
                .where('c', '<', 4)
                .where('d', '<=', 5);
            assert.equal(builder.buildCondition(query), 'WHERE (((`a`>?) AND (`b`>=?)) AND (`c`<?)) AND (`d`<=?)');
        });

        it('operator: like', function() {
            let query = new Query();
            query.where('a', 'like', '%abc')
                .where('b', 'like', 'abc%')
                .where('c', 'like', '%abc%');
            assert.equal(builder.buildCondition(query), 'WHERE ((`a` LIKE ?) AND (`b` LIKE ?)) AND (`c` LIKE ?)');
        });

        it('operator: not like', function() {
            let query = new Query();
            query.where('a', 'not like', '%abc')
                .where('b', 'not like', 'abc%')
                .where('c', 'not like', '%abc%');
            assert.equal(builder.buildCondition(query), 'WHERE ((`a` NOT LIKE ?) AND (`b` NOT LIKE ?)) AND (`c` NOT LIKE ?)');
        });

        it('operator: between', function() {
            let query = new Query();
            query.where('a', 'between', 100, 200);
            assert.equal(builder.buildCondition(query), 'WHERE `a` BETWEEN ? AND ?');
        });

        it('operator: not between', function() {
            let query = new Query();
            query.where('a', 'not between', 100, 200);
            assert.equal(builder.buildCondition(query), 'WHERE `a` NOT BETWEEN ? AND ?');
        });

        it('buildCondition-->1', function() {
            let query=new Query();
            query.where(
                [
                    ['a', 'IN', [1, 2, 3]],
                    ['b', '=', 2]
                ]
            );
            assert.equal(builder.buildCondition(query), 'WHERE (`a` IN (?)) AND (`b`=?)');

            query=new Query();
            query.where(
                [
                    ['a', '=', 1],
                    ['b', '=', 2]
                ]
            );

            assert.equal(builder.buildCondition(query), 'WHERE (`a`=?) AND (`b`=?)');

            query.where(
                [
                    ['c', '=', 3],
                    ['d', '=', 4]
                ], 'or');

            assert.equal(builder.buildCondition(query), 'WHERE ((`a`=?) AND (`b`=?)) AND ((`c`=?) OR (`d`=?))');

            query.orWhere(
                [
                    ['e', '=', 5],
                    ['f', '=', 6]
                ]);

            assert.equal(builder.buildCondition(query), 'WHERE (((`a`=?) AND (`b`=?)) AND ((`c`=?) OR (`d`=?))) OR ((`e`=?) AND (`f`=?))');
        });
    });

    describe('#makeFetchSql()', function() {
        const builder=new SqlBuilder();
        let query=new Query();
        query.select(['id', 'name'])
            .from('user')
            .where('id', [1, 2, 3])
            .groupBy('a, b')
            .having('a', '>', 2)
            .having('SUM(b)', '>', 2)
            .limit(10)
            .offset(5)
            .orderBy('id DESC')
            .orderBy('coin ASC');

        it('should return \'user\' when the column is \'`user`\'', function() {
            let ret=builder.makeFetchSql(query);
            assert.equal(ret, 'SELECT `id`, `name` FROM `user` WHERE `id` IN (?) GROUP BY `a`, `b` HAVING (`a`>?) AND (SUM(`b`)>?) ORDER BY `id` DESC, `coin` ASC LIMIT 5, 10');
        });
    });

    describe('#makeInsertSql()', function() {
        it('should a correct insert sql statement', function() {
            let query=new Query();
            query.table('pre_test').data({
                a: 1,
                b: 2,
                c: 3,
                d: 4
            });
            const builder=new SqlBuilder();
            let sql=builder.makeInsertSql(query);
            assert.equal(sql, 'INSERT `pre_test` (`a`,`b`,`c`,`d`) VALUES (?,?,?,?)');
        });
    });

    describe('#makeUpdateSql()', function() {
        it('should return a correct update sql statement', function() {
            let query = new Query();
            query.orderBy('id DESC')
                .table('pre_test')
                .data({
                    a: 7,
                    b: 8
                })
                .where([['id', '=', 2]])
                .limit(10);
            let builder = new SqlBuilder();
            let sql=builder.makeUpdateSql(query);

            assert.equal(sql, 'UPDATE `pre_test` SET `a`=?,`b`=? WHERE `id`=? ORDER BY `id` DESC LIMIT 10');
            assert.equal(JSON.stringify(query.binds), JSON.stringify([7,8,2]));
        });
    });
    describe('#makeDeleteSql()', function() {
        it('should return a correct delete sql statement', function() {
            let query=new Query();
            query.from('pre_test')
                .orderBy('id DESC')
                .limit(10)
                .where([['id', '=', 2]]);
            let builder=new SqlBuilder();
            let sql=builder.makeDeleteSql(query);

            assert.equal(sql, 'DELETE FROM `pre_test` WHERE `id`=? ORDER BY `id` DESC LIMIT 10');
            assert.equal(JSON.stringify(query.binds), JSON.stringify([2]));
        });
    });

});