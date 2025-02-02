const express = require('express')
const apiRouter = require('./apiRoute');
const middleware = require('./middleware');
const mongo = require('./mongoClient');
const dotenv = require('dotenv');

let app = undefined;

try {
    dotenv.config();
    const mongoClient = _initMongo();

    // I can't do await here because then this has to be a module, which it is not
    // somehow chaining thens is a solution, however ugly one, this probably can
    // be handled much more cleanly
    mongo.initData(mongoClient).then((r) => {
        if (r) {
            app = _init();
            app();
        } else {
            console.log('Mongo data loading failed');
            process.exit(-1);
        }
    }).catch(() => {
        console.log('Failed to init mongo');
        process.exit(-1);
    });
}
catch (err) {
    console.error('Application failed to load, reason:')
    console.error(err);
}

function _initMongo() {
    const client =  mongo.initMongo();
    return client;
}

function _init() {
    const app = express();
    // middleware must be attached first, this is quite limited
    // and truly annoying if you ask me
    app.use(middleware.firstMiddleware);

    app.use('/api/v1/', apiRouter);
    app.get('/', (req, res, next) => { res.send("Hello, this is Achtung Banan"); next();});

    app.use(middleware.lastMiddleware);

    // config
    const port = 3000;

    return () => { app.listen(port, () => { console.log("started"); }); }
}