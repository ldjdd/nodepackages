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
        return this._realTable();
    }

    _relations(){
        return [];
    }

    _realTable(table){
        if(typeof table == 'undefined') table = this.table;
        return table.replace(/\{\{(.*)\}\}/g, this.db.tablePrefix + "$1");
    }

    _reset(){
        this._fields = '*';
        this._condition = [];
        this._groupBy = '';
        this._having = '';
        this._offset = 0;
        this._limit = 0;
        this._order = '';
        this._withs = [];
    }

    with(name){
        if(typeof name == 'string')
        {
            let arr = name.split(' as ');
            if(arr.length == 2)
            {
                name = {
                    name : arr[0],
                    alias: arr[1]
                }
            }
            else
            {
                name = {
                    name: name
                };
            }
        }
        this._withs.push(name);
        return this;
    }

    _relationsToJoin(relations){
        var joins = [];
        if(this._withs.length > 0)
        {
            var outTable;
            var relation;
            for(let i=0; i<this._withs.length; i++){
                relation = relations[this._withs[i]['name']];
                outTable = this._realTable(relation['table']);
                joins.push(
                    {
                        table: outTable,
                        alias: this._withs[i].alias ? this._withs[i].alias : '',
                        on: 't.' + relation['on'][0] + '=' + (this._withs[i].alias ? this._withs[i].alias : outTable) + '.' + relation['on'][1],
                    }
                );
            }
        }
        return joins;
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

    where(condition){
        if(Array.isArray(condition))
        {
            this._condition = condition;
        }
        else
        {
            this._condition = [condition];
        }

        return this;
    }

    whereIn(field, matches, operator){
        var condStr = '';

        for (let i in matches) {
            condStr += `,'${matches[i]}'`;
        }

        if(matches.length > 0)
        {
            condStr = condStr.substr(1);
            condStr = `${field} in (${condStr})`;
        }
        else
        {
            condStr = '1=0'; // if `matches` is empty condition specified by a false condition
        }

        if(typeof operator != 'undefined')
        {
            operator = 'and';
        }

        this._condition.push([operator, condStr]);

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

    groupBy(group){
        this._groupBy = group;
        return this;
    }

    having(having){
        this._having = having;
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
            table: this._realTable(this.table),
            join: this._relationsToJoin(this._relations()),
            select: this._fields,
            condition: this._condition,
            groupBy: this._groupBy,
            having: this._having,
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
            join: this._relationsToJoin(this._relations()),
            condition: this._condition,
            groupBy: this._groupBy,
            having: this._having,
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
            join: this._relationsToJoin(this._relations()),
            groupBy: this._groupBy,
            having: this._having,
            order: this._order,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    scalar(field){
        var promise = command.scalar(this.db, {
            table: this.realTable,
            select: field,
            join: this._relationsToJoin(this._relations()),
            groupBy: this._groupBy,
            having: this._having,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    count(field){
        var promise = command.count(this.db, {
            table: this.realTable,
            select: field,
            join: this._relationsToJoin(this._relations()),
            groupBy: this._groupBy,
            having: this._having,
            condition: this._condition
        });

        this._reset();

        return promise;
    }

    insert(values){
        var promise = command.insert(this.db, {
            table: this.realTable,
            values: values
        });
        this._reset();
        return promise;
    }

    update(values){
        var promise = command.update(this.db, {
            table: this.realTable,
            values: values,
            condition: this._condition
        });
        this._reset();
        return promise;
    }

    delete(){
        var promise = command.update(this.db, {
            table: this.realTable,
            condition: this._condition
        });
        this._reset();
        return promise;
    }
};

module.exports = Model;