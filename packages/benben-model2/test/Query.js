var assert = require('assert');
var query = new(require('../lib/Query'))();

describe('Query', function() {
    describe('#select()', function() {
        it('should return true when pass a string, false otherwise', function() {
            query.select('id, name');
            assert.equal(query.getSelect(), true);
        });
    });
});