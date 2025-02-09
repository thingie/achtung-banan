const express = require('express');
const router = express.Router();
const { getDBClient } = require('./mongoClient');

// this all should also reply JSON at some point
// including Content-Type and all the fun

router.get('/getLocomotive/:number',
    async (req, res, next) => {
        const locNumber = parseInt(req.params.number, 10);
        if (!Number.isInteger(locNumber)) {
            res.status(400).send("invalid number");
            next();
            return;
        }
        if (locNumber < 1 || locNumber > 30) {
            res.status(404).send("this locomotive does not exist");
            next();
            return;
        }

        // leftpad for real
        const shortName = String(locNumber).padStart(3, '0');
        console.log("Trying to find " + shortName);

        dbClient = getDBClient();
        const r = await dbClient.locomotives.findOne({shortNumber: shortName});
	const trains = await dbClient.trainList.find({shortName: '151.'+shortName}).toArray();
	let info = `information about locomotive\nfull UIC number: ${r.uicNumber}\ncurrent state is ${r.state}\nadditional comment: ${r.comment}`;
	for (t in trains) {
		const train = trains[t];
		info += `\ntrain: ${train.train}, date: ${train.date}`;
	}
        if (r === null) {
            res.status(404).send("this locomotive does not exist");
       } else {
            res.send(info);
       }

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
