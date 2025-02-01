const express = require('express');
const router = express.Router();

router.get('/getLocomotive/:number',
    (req, res, next) => {
        res.send("I will report on a position of a specific locomotive");

        next();
    }
);

router.get('/getNearestLocomotive/:latitude/:longitude',
    (req, res, next) => {
        res.send("I will report on the nearest loco to the position");

        next();
    }
);

module.exports = router;