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
        this._fields = '*';
        this._condition = '';
        this._offset = 0;
        this._limit = 0;
        this._order = '';
    }

    select(fields){
        if (typeof fields === 'array')
        {
            this._fields = fields.join(',');
        }
        else if(typeof fields === 'string')
        {
            this._fields = fields;
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
        this._condition = [condition];
        return this;
    }

    andWhere(condition){
        this._condition.push(['and', condition]);
        return this;
    }

    orWhere(condition){
        this._condition.push(['or', condition]);
        return this;
    }

    order(order){
        this._order = order;
        return this;
    }

    offset(count){
        this._offset = count;
        return this;
    }

    limit(count){
        this._limit = count;
        return this;
    }

    all(key){
        var promise = command.all(this.db, {
            table: this.realTable,
            select: this._fields,
            order: this._order,
            limit: this._limit,
            offset: this._offset
        }, key);

        this._reset();

        return promise;
    }

    column(field, key){
        var promise = command.column(this.db, {
            table: this.realTable,
            select: field,
            order: this._order,
            limit: this._limit,
            offset: this._offset
        }, key);

        this._reset();

        return promise;
    }

    one(){
        var promise = command.one(this.db, {
            table: this.realTable,
            select: this._fields,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    scalar(field){
        var promise = command.one(this.db, {
            table: this.realTable,
            select: field,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    count(field){
        var promise = command.count(this.db, {
            table: this.realTable,
            select: field,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    insert(values){
        return command.insert(this.db, this.realTable, values);
    }

    update(values, params){
        var that = this;

        var sql = 'UPDATE ' + this.realTable + ' SET ?' + ' WHERE ' + this._condition;

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