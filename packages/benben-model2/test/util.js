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

    describe('#isEmpty()', function() {
        it('should return true when pass \'\'', function() {
            assert.equal(util.isEmpty(''), true);
        });
        it('should return true when pass []', function() {
            assert.equal(util.isEmpty([]), true);
        });
        it('should return true when pass {}', function() {
            assert.equal(util.isEmpty({}), true);
        });
        it('should return true when pass false', function() {
            assert.equal(util.isEmpty(false), true);
        });
        it('should return true when pass 0 or 0.0', function() {
            assert.equal(util.isEmpty(0), true);
            assert.equal(util.isEmpty(0.0), true);
            assert.equal(util.isEmpty(0.1), false);
        });
    });

    describe('#equalArray()', function() {
        it('should return true if two arrays are equal', function() {
            assert.equal(util.equalArray([], []), true);
            assert.equal(util.equalArray([1, 2, 3], [1, 2, 3]), true);
            assert.equal(util.equalArray([1, 2, [3, 4]], [1, 2, [3, 4]]), true);
        });
        it('should return false if two arrays are not equal', function() {
            assert.equal(util.equalArray([], ''), false);
            assert.equal(util.equalArray([1, 2, 3], [1, 2, 4]), false);
            assert.equal(util.equalArray([1, 2, [3, 4]], [1, 2, [2, 4]]), false);
        });
    });
});