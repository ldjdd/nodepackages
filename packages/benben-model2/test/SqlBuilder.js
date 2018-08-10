const assert = require('assert');
const SqlBuilder = require('../lib/SqlBuilder');
const util = require('../lib/util');
const Query = require('../lib/Query');

describe('QueryBuiler', function() {
    describe('#quoteColumnName()', function() {
        const builder = new SqlBuilder();
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
        const builder = new SqlBuilder();
        it('should return \'SELECT `id`, `name`\' when the column is [\'id\', \'name\']', function() {
            assert.equal(builder.buildSelect(['id', 'name']), 'SELECT `id`, `name`');
        });
        it('should return \'SELECT `id`, `name`\' when the column is [\'user.id\', \'user_id\'], \'name\']', function() {
            assert.equal(builder.buildSelect([['user.id', 'user_id'], 'name']), 'SELECT `user`.`id` AS `user_id`, `name`');
        });
        it('should return \'SELECT `id`, `name`\' when the column is [\'user.id\', \'user_id\'], \'name\']', function() {
            assert.equal(builder.buildSelect(['id', 'name'], true), 'SELECT DISTINCT `id`, `name`');
        });
    });

    describe('#buildFrom()', function() {
        const builder = new SqlBuilder();
        it('should return \'user\' when the column is \'`user`\'', function() {
            assert.equal(builder.buildFrom('user'), 'FROM `user`');
        });
        it('should return \'`user` AS `u`\' when the column is [\'user\', \'u\']', function() {
            assert.equal(builder.buildFrom(['user', 'u']), 'FROM `user` AS `u`');
        });
    });

    describe('#selectSql()', function() {
        const builder = new SqlBuilder();
        let query = new Query();
        query.select('id, name')
            .from('user')
            .limit(10)
            .offset(5)
            .orderBy('id DESC')
            .addOrderBy('coin ASC');
        it('should return \'user\' when the column is \'`user`\'', function() {
            let ret = builder.selectSql(query);
            assert.equal(ret[0], 'SELECT `id`, `name` FROM `user` ORDER BY `id` DESC, `coin` ASC LIMIT 5, 10');
        });
    });

    describe('#buildCondition()', function() {
        it('buildCondition-->1', function() {
            const builder = new SqlBuilder();
            const query = new Query();
            /*query.where([
                ['AND', [['', 'a', '=', 1]]],
                ['AND', [['', 'b', '=', 2],['AND', 'b2', '=', 3]]],
                ['OR', [['', 'c', '=', 2], ['AND', 'd', '=', 2]]]
            ]);*/
            query.where(
                [
                    ['a', '=', 1],
                    ['b', '=', 2]
                ]
            );
            // query.where([['c', '=', 2], ['d', '=', 2]], 'or')
            result = builder.buildCondition(query);
            console.log('result:');
            console.log(result);
            assert.equal(result, '((`a` = ?) AND ((`b` = ?) AND (`b2` = ?))) OR ((`c` = ?) AND (`d` = ?))');
            assert.equal(result, '((`a` = ?) AND ((`b` = ?) AND (`b2` = ?))) AND ((`c` = ?) OR (`d` = ?))');
            assert.equal(util.equalArray(query.binds, [1, 2, 3, 2, 2]), true);
        });
    });
});