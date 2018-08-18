const assert=require('assert');
const SqlBuilder=require('../lib/SqlBuilder');
const util=require('../lib/util');
const Query=require('../lib/Query');

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
            assert.equal(builder.buildFrom(['user', 'u']), 'FROM `user` AS `u`');
        });
    });

    describe('#buildCondition()', function() {
        it('buildCondition-->1', function() {
            const builder=new SqlBuilder();
            const query=new Query();
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
            .limit(10)
            .offset(5)
            .orderBy('id','DESC')
            .orderBy('coin','ASC');

        it('should return \'user\' when the column is \'`user`\'', function() {
            let ret=builder.makeFetchSql(query);
            assert.equal(ret, 'SELECT `id`, `name` FROM `user` ORDER BY `id` DESC, `coin` ASC LIMIT 5, 10');
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
            query.orderBy('id', 'DESC')
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
                .orderBy('id', 'DESC')
                .limit(10)
                .where([['id', '=', 2]]);
            let builder=new SqlBuilder();
            let sql=builder.makeDeleteSql(query);

            assert.equal(sql, 'DELETE FROM `pre_test` WHERE `id`=? ORDER BY `id` DESC LIMIT 10');
            assert.equal(JSON.stringify(query.binds), JSON.stringify([2]));
        });
    });

});