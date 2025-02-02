const express = require('express')
const apiRouter = require('./apiRoute');
const middleware = require('./middleware');
const mongo = require('./mongoClient');
const dotenv = require('dotenv');

let app = undefined;

try {
    dotenv.config();
    const mongoClient = _initMongo();
    app = _init();
}
catch (err) {
    console.error('Application failed to load, reason:')
    console.error(err);
}

app();

function _initMongo() {
    const client =  mongo.initMongo();
    mongo.initData(client);
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