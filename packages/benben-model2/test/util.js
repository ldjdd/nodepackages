var assert = require('assert');
var util = require('../lib/util');

describe('util', function() {
    describe('#isString()', function() {
        it('should return true when pass a string, false otherwise', function() {
            assert.equal(util.isString('string'), true);
            assert.equal(util.isString([]), false);
            assert.equal(util.isString({}), false);
            assert.equal(util.isString(undefined), false);
            assert.equal(util.isString(null), false);
            assert.equal(util.isString(function(){}), false);
        });
    });

    describe('#isArray()', function() {
        it('should return true when pass an array, false otherwise', function() {
            assert.equal(util.isArray([]), true);
            assert.equal(util.isArray('string'), false);
            assert.equal(util.isArray({}), false);
            assert.equal(util.isArray(undefined), false);
            assert.equal(util.isArray(null), false);
            assert.equal(util.isArray(function(){}), false);
        });
    });
});