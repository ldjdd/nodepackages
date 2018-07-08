/**
 * Created by ldj on 2017/6/13.
 */
var assert = require('assert');
var mysql = require('mysql');
var co = require('co');
var BaseModel = require('../index');
var db = require('./db')

var orderTable = '{{orders}}';
var orderItemTable = '{{order_items}}';

const order = new (class me extends BaseModel{
    get db(){
        return db;
    }

    get table(){
        return orderTable;
    }

    _relations(){
        return {
            items: {
                table: orderItemTable,
                on: ['order_id', 'order_id']
            }
        };
    }
})();

const item = new (class me extends BaseModel{
    get db(){
        return db;
    }

    get table(){
        return orderItemTable;
    }
})();

describe('order', function() {
    describe('#realTable', function() {
        it('should return pre_orders when the value is {{orders}}', function() {
            assert.equal('pre_orders', order.realTable);
        });
    });

    describe('#all', function() {
        it('result should be two-dimensional array', function() {
            co(function*() {
                var result = yield order.all('order_id');
                assert.equal('123456', result['123456']['order_id']);
                assert.equal('1234567', result['1234567']['order_id']);
            });
        });
    });

    describe('#relations', function() {
        it('result should be with join tables', function() {
            co(function*() {
                var result = yield order.with('items').select('t.order_id').all('order_id');
                assert.equal('123456', result['123456']['order_id']);
                assert.equal('1234567', result['1234567']['order_id']);
            });
        });
        it('table alias', async function() {
                var result = await order.with('items as i').select('t.order_id').all('order_id');
                assert.equal('123456', result['123456']['order_id']);
                assert.equal('1234567', result['1234567']['order_id']);
        });
    });
    describe('#column', function() {
        it('result should be one-dimensional array', async function() {
            var result = await order.column('order_id');
            assert.equal(true, Array.isArray(result));
        });
    });

    describe('#scalar', function() {
        it('result should be 123456', function() {
            co(function*() {
                var result = yield order.select('order_id').where({order_id: '123456'}).scalar();
                assert.equal('123456', result);
            });
        });
    });
    describe('#where', function() {
        it('result should be one-dimensional array', function() {
            co(function*() {
                let condition = [{uid: 1}];
                condition.push(['and', 'order_id = \'' + 123456 + '\'']);
                var result = yield order.where(condition).all();
                assert.equal('1', result.length);
                assert.equal('123456', result[0]['order_id']);
            });
        });
    });

    describe('#whereIn', function() {
        it('result should be one-dimensional array', async function() {
                var result = await order.whereIn('uid', [1])
                    .where({order_id: 123456}).all();
                assert.equal('1', result.length);
                assert.equal('123456', result[0]['order_id']);
        });
    });
});

