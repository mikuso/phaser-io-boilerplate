const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const butternut = require('butternut');
const browserify = require('browserify');
const expressLess = require('express-less');
const concatStream = require('concat-stream');
const commander = require('commander');
const WebServer = require('./lib/webserver');
const GameCore = require('./game/core');


function getClientBundle({debug = false} = {}) {
    let bundler = browserify({
        debug,
        noParse: [
            path.resolve(__dirname, './node_modules/phaser/dist/phaser.min.js')
        ],
        entries: [
            path.resolve(__dirname, './client/index.js')
        ]
    });
    let stream = bundler.bundle();
    return stream;
}

async function runBuild() {
    console.log(chalk.green.bold('[√]'), `Pre-bundling and minifying client scripts`);
    let start = Date.now();
    let bundle = await new Promise((resolve, reject) => {
        let streamConsumer = concatStream(buff => {
            resolve(buff.toString('utf8'));
        });
        let stream = getClientBundle({debug: false});
        stream.once('error', reject);
        stream.pipe(streamConsumer);
    });

    let {code, map} = butternut.squash(bundle, {check: true});
    bundle = code;

    // cache a copy of the bundle to disk
    await new Promise((resolve, reject) => {
        fs.writeFile(path.resolve(__dirname, './public/main.js'), bundle, (err) => {
            err ? reject(err) : resolve();
        });
    });

    console.log(chalk.green.bold('[√]'), `Compile time: ${(Date.now() - start).toLocaleString()} ms`);
    return bundle;
}

const webserver = new WebServer();
const gameserver = new GameCore({webserver});

async function setupRoutes() {
    if (process.env.NODE_ENV === 'production') {
        // production env
        const bundle = await runBuild();

        webserver.app.get('/main.js', (req, res) => {
            res.type('text/javascript').send(bundle);
        });

        console.log(chalk.green.bold('[√]'), `Caching and minifying LESS -> CSS`);
        webserver.app.use('/css', expressLess(path.resolve(__dirname, './public/less'), {
            compress: true,
            cache: true
        }));

    } else {
        // development env
        console.log(chalk.green.bold('[√]'), `Live bundling client scripts`);
        webserver.app.get('/main.js', (req, res) => {
            res.type('text/javascript');
            let stream = getClientBundle({debug: true});
            stream.on('error', err => {
                res.end();
                console.error(`Error compiling client:`, err.stack);
            });
            stream.pipe(res);
        });

        console.log(chalk.green.bold('[√]'), `Live compiling LESS -> CSS`);
        webserver.app.use('/css', expressLess(path.resolve(__dirname, './public/less'), {
            debug: true
        }));
    }

    // serve assets
    webserver.app.use(require('express').static(path.resolve(__dirname, './public')));
}

// interrupt handler
process.on('SIGINT', function onInterrupt() {
    if (onInterrupt.interrupted) return;
    onInterrupt.interrupted = true;
    console.log(chalk.red.bold('[!]'),`Shutting down gracefully. Press Ctrl+Break to force close.`);
    gameserver.shutdown().catch(err => {
        console.error(`Error during shutdown:`, err);
        process.exit(1);
    });
});

async function main() {
    commander
        .option('-b, --build', "Build for production")
        .parse(process.argv);

    try {
        if (commander.build) {
            // run build process
            await runBuild();

        } else {
            // run game
            await setupRoutes();
            // start gameserver
            await gameserver.startup();
        }
    } catch (err) {
        console.error(`Error on startup:`, err);
        process.exit(1);
    }
}
main();
