/**
 * Created by ldj on 2017/5/10.
 */

const command = require('./lib/command');

const Model = class me{
    constructor(){
        this._reset();
    }

    get db(){
        throw new Error("Child must be overwrite 'get db' method!");
    }

    /**
     * children must be overwrite the method
     * @return {string}
     */
    get table(){
        throw new Error("Child must be overwrite 'get table' method!");
    }

    get realTable(){
        return this.table.replace(/\{\{(.*)\}\}/g, this.db.tablePrefix + "$1");
    }

    _reset(){
        this.fields = '*';
        this.condition = '';
        this._offset = 0;
        this.selectCount = 0;
        this.orderBy = '';
    }

    select(fields){
        if (typeof fields === 'array')
        {
            this.fields = fields.join(',');
        }
        else if(typeof fields === 'string')
        {
            this.fields = fields;
        }

        return this;
    }

    _conditionToStr(condition){
        let tmp = '';
        if(typeof condition == 'object')
        {
            for (let k in condition)
            {
                tmp += " and " + k + "='" + condition[k] + "'";
            }
            var d = tmp.substr(5);
            return d;
        }
        else if(typeof condition == 'string')
        {
            tmp = condition;
        }

        return tmp;
    }

    where(condition){
        this.condition = this._conditionToStr(condition);
        return this;
    }

    andWhere(condition){
        let tmp = this._conditionToStr(condition);

        if(this.condition.length > 0)
        {
            this.condition += ' and (' + tmp + ')';
        }
        else
        {
            this.condition = tmp;
        }

        return this;
    }

    orWhere(condition){
        if(this.condition.length > 0)
        {
            this.condition += " or (" + condition + ")";
        }
        else
        {
            return this.where(condition);
        }
        return this;
    }

    order(orderBy){
        this.orderBy = orderBy;
        return this;
    }

    offset(count){
        this._offset = count;
        return this;
    }

    limit(count){
        this.selectCount = count;
        return this;
    }

    all(key){
        return command.all(this.db, {
            table: this.realTable,
            select: this.fields
        }, key);
    }

    column(field, key){
        return command.column(this.db, {
            table: this.realTable,
            select: field
        })
    }

    one(){
        this.limit(1);
        var that = this;
        var sql = this._querySQL();
        this._reset();

        return new Promise(function (resolve, reject) {

            command.query(that.db.pool, sql, function (error, results, fields) {
                if (error)
                {
                    return reject(error);
                }
                return resolve(results[0]);
            });

        });
    }

    scalar(field){
        this.limit(1);
        this.select(field);
        var that = this;
        var sql = this._querySQL();
        this._reset();

        return new Promise(function (resolve, reject) {

            command.query(that.db.pool, sql, function (error, results, fields) {
                if (error)
                {
                    return reject(error);
                }
                if(results.length > 0)
                {
                    return resolve(results[0][field]);
                }
                return false;
            });

        });
    }

    count(field){
        if(typeof field == "undefined"){
            field = '*';
        }
        this.select('count(' + field + ') as _sum');
        var that = this;
        var sql = this._querySQL();
        this._reset();

        return new Promise(function (resolve, reject) {

            command.query(that.db.pool, sql, function (error, results, fields) {
                if (error)
                {
                    return reject(error);
                }
                if(results.length > 0)
                {
                    return resolve(results[0]['_sum']);
                }
                return false;
            });

        });
    }

    insert(values){
        var that = this;

        var sql = 'INSERT INTO ' + this.realTable + ' SET ?';

        return new Promise(function (resolve, reject) {
            command.insert(that.db.pool, sql, values, function (error, results) {
                if (error)
                {
                    return reject(error);
                }
                return resolve(results.insertId);
            });
        });
    }

    update(values, params){
        var that = this;

        var sql = 'UPDATE ' + this.realTable + ' SET ?' + ' WHERE ' + this.condition;

        return new Promise(function (resolve, reject) {

            command.update(that.db.pool, sql, values, function (error, results) {
                if (error)
                {
                    return reject(error);
                }
                return resolve(results.insertId);
            });
        });
    }

};

module.exports = Model;