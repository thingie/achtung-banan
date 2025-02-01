const express = require('express')
const apiRouter = require('./apiRoute');
const middleware = require('./middleware');

_init();

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

    app.listen(port, () => { console.log("started"); });
}