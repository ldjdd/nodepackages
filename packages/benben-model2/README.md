## Installation
Using npm:

```
$ npm i --save benben-model
```

## Introduction
This is a simple model layer, it's convenient to access database.
Note: now, it's just only support mysql!

## Using steps:
1. Create a database connection file.

    Frist we create a directory it's named config, then we create db.js in it. It's look like this:
    
```
var mysql=require("mysql");

exports = {
    host:      '127.0.0.1', // host of database server
    user:      'root',      // user of database
    password:  '123456',    // user's password of database 
    database:  'tests',     // database name
    port:      3306,        // connection port
    tablePrefix: 'pre_'     // table prefix
};

exports.pool = mysql.createPool({
    host:      exports.host,
    user:      exports.user,
    password:  exports.password,
    database:  exports.database,
    port:      exports.port,
    bigNumberStrings: true
});

module.exports = exports;
```

2. Create a base class for our model classes(in my project I put it in 'models' folder), it's help us to rquire database configure file. It's look like this:


```
var BenbenModel = require('benben-model');
var dbs = {};

module.exports = class Model extends BenbenModel{
    get db(){
        if(!dbs.hasOwnProperty(this.dbname))
        {
            dbs[this.dbname] = require('../config/' + this.dbname);
        }
        return dbs[this.dbname];
    }

    get dbname(){
        return 'db';
    }
};

```

3. Create a model class in models folder. It's look like this:


```
var BaseModel = require('./Model');

module.exports = class User extends BaseModel{
    get dbname(){
        return 'db';
    }

    get table(){
        return '{{user}}';
    }

};

```

4. Using 'User' Model


```
var UserModel = require('../models/User');
var user = new UserModel();

var userInfo = user.where({uid: 1}).one;
console.info(userInfo);
```
