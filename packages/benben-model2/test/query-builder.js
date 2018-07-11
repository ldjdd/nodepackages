var assert = require('assert');
var builder = require('../lib/query-builder');

describe('QueryBuiler', function() {
    describe('#quoteColumnName()', function() {
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
        it('should return \'user\' when the column is \'`user`\'', function() {
            assert.equal(builder.buildFrom('user'), '`user`');
        });
        it('should return \'`user` AS `u`\' when the column is [\'user\', \'u\']', function() {
            assert.equal(builder.buildFrom(['user', 'u']), '`user` AS `u`');
        });
    });
});