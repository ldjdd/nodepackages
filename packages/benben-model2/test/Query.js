const assert = require('assert');
const query = new (require('../lib/Query'))();
const _ = require('lodash');

describe('Query', function() {
    describe('#select()', function() {
        it('should return [\'id\', \'name\'] or \'id, name\' when pass \'id, name\'', function() {
            query.select('id, name');
            assert.equal(_.isEqual(query.getSelect(), ['id', 'name']), true);
            query.select(['id', 'name']);
            assert.equal(_.isEqual(query.getSelect(), ['id', 'name']), true);
        });
    });
    describe('#addSelect()', function() {
        it('should return true when pass a string, false otherwise', function() {
            assert.equal(_.isEqual(query.select('id')
                .addSelect('name')
                .addSelect(['token'])
                .getSelect(),
                ['id', 'name', 'token']), true);
        });
    });
    describe('#getFrom()', function() {
        it('should return true when pass a string, false otherwise', function() {
            assert.equal(_.isEqual(query.from('user')
                .getFrom(),
                ''), true);
        });
    });
});