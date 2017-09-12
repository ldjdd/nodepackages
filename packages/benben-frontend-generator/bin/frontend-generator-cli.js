#!/usr/bin/env node

var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var program = require('commander')
var readline = require('readline')
var util = require('util')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

var _exit = process.exit
var pkg = require('../package.json')

var version = pkg.version

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
    program.outputHelp()
    fn.apply(this, args)
    return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
    // track if help was shown for unknown option
    this._helpShown = true
})

before(program, 'unknownOption', function () {
    // allow unknown options if help was shown, to prevent trailing error
    this._allowUnknownOption = this._helpShown

    // show help if not yet shown
    if (!this._helpShown) {
        program.outputHelp()
    }
})

program
    .version(version, '    --version')
    .usage('[options] [dir]')
    .option('-H, --hogan', 'add hogan.js engine support', renamedOption('--hogan', '--view=hogan'))
    .option('-f, --force', 'force on non-empty directory')
    .option('-c, --css <engine>', 'add stylesheet <engine> support (less|stylus|compass|sass) (defaults to plain css)')
    .option('    --git', 'add .gitignore')
    .parse(process.argv)

if (!exit.exited) {
    main()
}

/**
 * Install an around function; AOP.
 */

function around (obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        var args = new Array(arguments.length)
        for (var i = 0; i < args.length; i++) args[i] = arguments[i]
        return fn.call(this, old, args)
    }
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
    var old = obj[method]

    obj[method] = function () {
        fn.call(this)
        old.apply(this, arguments)
    }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    rl.question(msg, function (input) {
        rl.close()
        callback(/^y|yes|ok|true$/i.test(input))
    })
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
    from = path.join(__dirname, '..',  'template', from)
    write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication (name, path) {
    var wait = 5

    console.log()
    function complete () {
        if (--wait) return
        var prompt = launchedFromCmd() ? '>' : '$'

        console.log()
        console.log('   install dependencies:')
        console.log('     %s cd %s && npm install', prompt, path)
        console.log()
        console.log('   run the app:')

        if (launchedFromCmd()) {
            console.log('     %s SET DEBUG=%s:* & npm start', prompt, name)
        } else {
            console.log('     %s DEBUG=%s:* npm start', prompt, name)
        }

        console.log()
    }

    mkdir(path, function () {
        mkdir(path + '/src', function () {

            // copyTemplate('package.json', path + '/package.json')
            copyTemplate('webpack.main.js', path + '/webpack.main.js')
            copyTemplate('postcss.main.js', path + '/postcss.main.js')

            copyTemplate('src/App.vue', path + '/src/App.vue')
            copyTemplate('src/index.html', path + '/src/index.html')
            copyTemplate('src/main.js', path + '/src/main.js')
            copyTemplate('src/css.js', path + '/src/css.js')

            mkdir(path + '/src/assets')
            mkdir(path + '/src/components')
            mkdir(path + '/src/images')

            mkdir(path + '/src/config', function(){
                copyTemplate('src/config/routes.js', path + '/src/config/routes.js')
                copyTemplate('src/config/main.js', path + '/src/config/main.js')
            })

            mkdir(path + '/src/libs', function(){
                copyTemplate('src/libs/openapi.js', path + '/src/libs/openapi.js')
            })

            mkdir(path + '/src/views', function(){
                copyTemplate('src/views/index.vue', path + '/src/views/index.vue')
            })

            mkdir(path + '/src/stylesheets', function () {
                switch (program.css) {
                    case 'less':
                        copyTemplate('src/css/style.less', path + '/src/stylesheets/style.less')
                        break
                    case 'stylus':
                        copyTemplate('src/css/style.styl', path + '/src/stylesheets/style.styl')
                        break
                    case 'compass':
                        copyTemplate('src/css/style.scss', path + '/src/stylesheets/style.scss')
                        break
                    case 'sass':
                        copyTemplate('src/css/style.sass', path + '/src/stylesheets/style.sass')
                        break
                    case 'css':
                        copyTemplate('src/css/style.css', path + '/src/stylesheets/style.css')
                        break
                    default:
                        copyTemplate('src/css/style.scss', path + '/src/stylesheets/style.scss')
                        break
                }
                complete()
            })
        })

        // CSS Engine support
        /*switch (program.css) {
            case 'less':
                app.locals.modules.lessMiddleware = 'less-middleware'
                app.locals.uses.push("lessMiddleware(path.join(__dirname, 'public'))")
                break
            case 'stylus':
                app.locals.modules.stylus = 'stylus'
                app.locals.uses.push("stylus.middleware(path.join(__dirname, 'public'))")
                break
            case 'compass':
                app.locals.modules.compass = 'node-compass'
                app.locals.uses.push("compass({ mode: 'expanded' })")
                break
            case 'sass':
                app.locals.modules.sassMiddleware = 'node-sass-middleware'
                app.locals.uses.push("sassMiddleware({\n  src: path.join(__dirname, 'public'),\n  dest: path.join(__dirname, 'public'),\n  indentedSyntax: true, // true = .sass and false = .scss\n  sourceMap: true\n})")
                break
        }*/


        // package.json
        var pkg = {
            "name": name,
            "version": "0.0.0",
            "description": "",
            "main": "index.js",
            "scripts": {
                "dev": "webpack-dev-server --inline --hot --env.dev",
                "build": "rimraf dist && webpack -p --progress --hide-modules",
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "keywords": [],
            "author": "",
            "license": "ISC",
            "dependencies": {
                "axios": "^0.16.2",
                "benben-openapi": "^1.0.0",
                "element-ui": "^1.4.2",
                "vue": "^2.4.2",
                "vue-router": "^2.7.0"
            },
            "devDependencies": {
                "babel-core": "^6.26.0",
                "babel-loader": "^7.1.2",
                "babel-preset-es2015": "^6.24.1",
                "babel-preset-vue-app": "^1.2.0",
                "css-loader": "^0.28.5",
                "file-loader": "^0.10.1",
                "html-webpack-plugin": "^2.30.1",
                "node-sass": "^4.5.3",
                "postcss-loader": "^2.0.6",
                "rimraf": "^2.5.4",
                "sass-loader": "^6.0.6",
                "style-loader": "^0.18.2",
                "url-loader": "^0.5.9",
                "vue-loader": "^13.0.4",
                "vue-template-compiler": "^2.4.2",
                "webpack": "^3.5.5",
                "webpack-dev-server": "^2.7.1"
            }
        }

        // write files
        write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n')

        if (program.git) {
            copyTemplate('gitignore', path + '/.gitignore')
        }

        complete()
    })
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName (pathName) {
    return path.basename(pathName)
        .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
        .replace(/^[-_.]+|-+$/g, '')
        .toLowerCase()
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory (path, fn) {
    fs.readdir(path, function (err, files) {
        if (err && err.code !== 'ENOENT') throw err
        fn(!files || !files.length)
    })
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
    // flush output for Node.js Windows pipe bug
    // https://github.com/joyent/node/issues/6247 is just one bug example
    // https://github.com/visionmedia/mocha/issues/333 has a good discussion
    function done () {
        if (!(draining--)) _exit(code)
    }

    var draining = 0
    var streams = [process.stdout, process.stderr]

    exit.exited = true

    streams.forEach(function (stream) {
        // submit empty write request and wait for completion
        draining += 1
        stream.write('', done)
    })

    done()
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd () {
    return process.platform === 'win32' &&
        process.env._ === undefined
}

/**
 * Main program.
 */

function main () {
    // Path
    var destinationPath = program.args.shift() || '.'

    // App name
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

    // View engine
    if (program.css === undefined) {
        program.css = 'sass'
    }

    // Generate application
    emptyDirectory(destinationPath, function (empty) {
        if (empty || program.force) {
            createApplication(appName, destinationPath)
        } else {
            confirm('destination is not empty, continue? [y/N] ', function (ok) {
                if (ok) {
                    process.stdin.destroy()
                    createApplication(appName, destinationPath)
                } else {
                    console.error('aborting')
                    exit(1)
                }
            })
        }
    })
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir (path, fn) {
    mkdirp(path, MODE_0755, function (err) {
        if (err) throw err
        console.log('   \x1b[36mcreate\x1b[0m : ' + path)
        fn && fn()
    })
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption (originalName, newName) {
    return function (val) {
        warning(util.format("option `%s' has been renamed to `%s'", originalName, newName))
        return val
    }
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning (message) {
    console.error()
    message.split('\n').forEach(function (line) {
        console.error('  warning: %s', line)
    })
    console.error()
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write (path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || MODE_0666 })
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}