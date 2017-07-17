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
        this._resetCondition();
        this.selectCount = 0;
        this.orderBy = '';
    }

    _resetCondition(){
        this.condition = '';
    }

    _querySQL(){
        var sql = 'select ' + this.fields + ' from ' + this.realTable;

        if (this.condition.length > 0) {
            sql += ' where ' + this.condition;
        }

        if(this.orderBy.length > 0){
            sql += ' order by ' + this.orderBy;
        }

        if(this.selectCount > 0){
            sql += ' limit ' + this.selectCount;
        }

        return sql;
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
        this._resetCondition();
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

    limit(count){
        this.selectCount = count;
        return this;
    }

    all(key){
        var that = this;
        var sql = this._querySQL();
        this._reset();

        return new Promise(function (resolve, reject) {

            command.query(that.db.pool, sql, function (error, results, fields) {
                if (error) return reject(error);

                if(typeof(key) == 'string')
                {
                    let data = {};
                    for(let k=0; k<results.length; k++)
                    {
                        data[results[k][key]] = results[k];
                    }
                    return resolve(data);
                }
                return resolve(results);
            });
        });
    }

    column(field, key){
        var that = this;
        this.select([field, key]);
        var sql = this._querySQL();
        this._reset();

        return new Promise(function (resolve, reject) {

            command.query(that.db.pool, sql, function (error, results, fields) {
                if (error)
                {
                    return reject(error);
                }

                let data;

                if(typeof key == 'undefined')
                {
                    data = [];
                    for(let i=0; i<results.length; i++)
                    {
                        data.push(results[i][field]);
                    }
                }
                else
                {
                    data = {};
                    for(let i=0; i<results.length; i++)
                    {
                        data[results[i][key]] = results[i][field];
                    }
                }

                return resolve(data);
            });

        });
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
        this._reset();

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
        this._reset();

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

};

module.exports = Model;