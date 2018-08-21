# benben-query


[toc]


## Install

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/). Node.js 8 or higher is required.

Installation is done using the [`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):


```sh
$ npm install benben-query
```

## Introduction

benben-query allows you to construct a SQL query in a programmatic and DMS-agnostic way. Compared to writing raw SQL statements, using benben-query will help you write more readable SQL-related code and generate more secure SQL statements.

Here is an example on how to use it:


```
const bb = require('benben-query');

bb.conn({
    type: 'mysql',
    host:      '127.0.0.1',
    user:      'root',
    password:  '123456',
    database:  'test',
    port:      3306
});

var rows = bb.query()
    .select(['id', 'name'])
    .from('user')
    .all();
```

From this example, you can learn the following:

- First you have to call bb.conn() method to tell 'benben-query' the details of connection before you call query(), that called 'Create connection'.
- Calling query() creates a Query object and then uses it.


## Quick Using

Configuration of database

```
const bb = require('benben-query');

bb.conn({
    type: 'mysql',          // The database type
    host:      '127.0.0.1', // The hostname or ip address of database server
    user:      'root',      // The username for connect to the database server
    password:  '123456',    // The password for connect to the database server
    database:  'test',      // The default scheme to be used
    port:      3306         // The port number exposed by the database server
});

(async function(){
    let query = db.query();
    let rows = await query.select(['id', 'name'])
                .from('user')
                .all();

})();

```

## Building Queries

To build a Query object, you call different query building methods to specify different parts of a SQL query. The names of these methods resemble the SQL keywords used in the corresponding parts of the SQL statement.For example, to specify the FROM part of a SQL query,you would call the [from()](#from) method. All the query building methods return the query object itself,which allows you to chain multiple calls together.

In the following, we will describe the usage of each query building method.

### ++select()++

The [select()](#select) method specifies the ==SELECT== fragment of a SQL statement. You can specify columns to be selected in an array, like the following. The column names being selected will be automatically quoted when the SQL statement is being generated from a query object.

```js
query.select(['id', 'email']);
```

The column names being selected may include table prefixes and/or column aliases, like you do when writing raw SQL queries. 

For example:

```
query.select(['user.id AS user_id', 'email']);
```

If you do not call the [select()](#select) method when bulding a query, ==*== will be selected, which means selecting all columns.

Besides column names, you can also select DB expressions.

For example:

```
query.select(['COUNT(*) AS total']);
```

To select distinct rows, you may call [distinct()](#distinct), like the following:

```
query.select(['uid']).distinct();
```

You can multiple call [select()](#select) method, it will merge all column names in query object.

For example:

```
query.select(['uid', 'email']);
query.select(['money']);
// it equals to the following code
// query.select(['uid', 'email', 'money']);
```

### from()

The [from()](#from) method specifies the ==FROM== fragment of a SQL statement.

For example:

```
query.from('user');
```

The table name may contain schema prefixes and/or table aliases, like you do when writing raw SQL statement.

For example:

```
query.from('public.user AS u');
```

### where()

The [where()](#where) method specifies the ==WHERE== fragment of a SQL query. The new condition and the existing one will be joined using ==AND== operator. You can use one of the three formats to specify a ==WHERE== condition:

- two parameters format, e.g. ==(uid, 1)== or ==(uid, [1, 2, 3])==
- operator format, e.g. ==('uid', '>', 10)==
- array format, e.g. ==[['a', '=', 1], ['b', 'in', [1, 2, 3]]]==

> Two parameters format

Two parameters format is best used to specify very simple conditions when you want to add equal condition or in condition.

```
// `uid`=1
query.where(uid, 1);
// `status` IN (1, 2, 3)
query.where(status, [1, 2, 3]);
```

> Operator format

Operator format allows you to specify arbitrary conditions in a programmatic way. It takes the following format:

```
(column, operator, operand1, operand2, ...)
```

The operator can be one of the following:

```
query.where('uid', '>', 100);
query.where('uid', '>=', 100);
query.where('uid', '<', 100);
query.where('uid', '<=', 100);
query.where('a', 'LIKE', '%a');
query.where('b', 'NOT LIKE', '%a');
query.where('c', 'IN', [1, 2, 3]);
query.where('d', 'NOT IN', [1, 2, 3]);
query.where('e', 'BETWEEN', 100, 200);
query.where('e', 'NOT BETWEEN', 100, 200);
```

Using the Operator Format, Query internally uses parameter binding for values.

> Array Format

Array Format allows you add multiple additional conditions in one time. It takes the following format:

```
(conditions, operator)
```

The ==operator== parameter specifies the conditions linked using *or*/*and* each other, default value is *and*. 

```
query.where(a, 1)
    .where(
        [
            ['c', '=', 3],
            ['d', '=', 4]
        ], 'or');
```

The following WHERE condition will be generated:

```
WHERE (`a` = 1) AND (`c` = 3 OR `d` = 4)
```


> Appending Conditions

You can use [where()](#where) or [orWhere()](#orWhere) to append additional conditions to an existing one. You can call them multiple times to append multiple conditions separately. 

For example:

```
query.where('uid', 1).where('status', 2);
```

The following WHERE condition will be generated:

```
WHERE (`uid` = 1) AND (`status` = 2)
```

### orWhere()

Adds an additional WHERE condition to the existing one. The new condition and the existing one will be joined using the ==OR== operator. It takes a condition which can be specified in the same way as that for [where()](#where). 

For example: 


```
query.where('a', 1).orWhere('b', 2);
```



### orderBy()

The [orderBy()](#orderBy) method specifies the ==ORDER BY== fragment of a SQL query.

For example:


```
query.orderBy('id ASC');
query.orderBy('id ASC, name DESC');
```


### groupBy()

The [groupBy()](#groupBy) method specifies the ==GROUP BY== fragment of a SQL query.

For example:


```
query.groupBy('a, b');
```

### having()

The [having()](#having) method specifies the ==HAVING== fragment of a SQL query. It takes a condition which can be specified in the same way as that for [where()](#where).

For example: 


```
query.having('status', 1);
```

Please refer to the documentation for [where()](#where) more details about how to specify a condtion.

You can call [having()](#having) or [orHaving()](#orHaving) to append additional conditions to the ==HAVING== fragment.

### limit() and offset()

The limit() and offeset() methods specify the LIMIT and OFFSET fragment of a SQL query.

For example: 


```
// ... LIMIT 10 OFFSET 20
query.limit(10).offset(20);
```

### join()

The join() method specifies the JOIN fragment of a SQL query. 

For example:

```
query.join('LEFT JOIN', 'post', 'post.user_id = user.id');
```

The join() method takes three parameters: 

    - type: join type, e.g. 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN' .
    - table: the name of the table to be joined.
    - on: optional, the join condition, i.e. the ==ON== fragment. 

You can use the following shortcut methods to specify INNER JOIN, LEFT JOIN AND RIGHT JOIN, respectively.

    - innerJoin()
    - leftJoin()
    - rightJoin()
    
For example:

```
query.leftJoin('post', 'post.user_id = user.id');
```

To join with multiple tables, call the above join methods multiple times, once for each table.


## Query Methods

Query provides a whole set of methods for different query purposes and all of them return a promise object respectly.

### all()

Returns an array of rows with each row being an associative array of name-value pairs.

```
let users = await query.select('uid, name').from('user').where('uid', [1, 2]).all();
// users: [{'uid': 1, name: 'a'}, {'uid': 2, name: 'b'}];
```

### one()

Returns the first row of the result.

```
let user = await query.select('uid, name').from('user').where('uid', 1).one();
// user: {'uid': 1, name: 'a'};
```

### column()

Return the first column of the result.

```
let names = await query.select('name').from('user').where('uid', [1, 2]).column();
// names: ['a', 'b'];
```

### scalar()

Returns a scalar value located at the first row and first column of the result.

```
let name = await query.select('name').from('user').where('uid', 1).column();
// name: 'a';
```

### exists()

Returns a value indication wheather the query contains any result.

```
let exist = await query.from('user').where('uid', 1).exists();
// exist: true;
```

### count()

Returns the result of a ==COUNT== query.

```
let count = await query.from('user').where('uid', '>', 10).count();
// count: 100;
```

### sum()

Returns the result of a ==SUM== query.

```
let coin = await query.from('user').sum('coin');
// coin: 100200;
```

## Db Connections

### Create default db connection

You can create a default db connection by calling method conn() and not pass the second parameter.

The following codes show how to create a default connection:

```
const bb = require('benben-query');

bb.conn({
    type: 'mysql',          // The type of database
    host:      '127.0.0.1', // The hostname or ip address of database server
    user:      'root',      // The username for connect to the database server
    password:  '123456',    // The password for connect to the database server
    database:  'test',      // The default scheme to be used
    port:      3306         // The port number exposed by the database server
});
```

By default, it will use the default db connection in a query.

### Create named db connections

If you want to create multiple connections that you have to specify a name for a connection by the second parameter of the method conn(), except the default connection.

For example: 

```
const bb = require('benben-query');

// the default connection
bb.conn({
    type: 'mysql',          // The type of database
    host:      '127.0.0.1', // The hostname or ip address of database server
    user:      'root',      // The username for connect to the database server
    password:  '123456',    // The password for connect to the database server
    database:  'db2',      // The default scheme to be used
    port:      3306         // The port number exposed by the database server
});

// the connection db2
bb.conn({
    type: 'mysql',          // The type of database
    host:      '127.0.0.1', // The hostname or ip address of database server
    user:      'root',      // The username for connect to the database server
    password:  '123456',    // The password for connect to the database server
    database:  'db2',      // The default scheme to be used
    port:      3306         // The port number exposed by the database server
}, 'db2');
```

### Using named connection in a query

You can specify a named db connection by the parameter of db of query().

For example:

```
const bb = require('benben-query');
bb.query(db2).from('user').where('uid', 1).one();
```

## A Project Demo

