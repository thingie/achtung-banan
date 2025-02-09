const { Agenda } = require("agenda");
const mongo = require("./mongoClient");
const scraper = require("./scraper");

// this doesn't even work, what a waste of time
// it probably doesn't support mongo this new or like something, I don't know

let jobQueue = undefined;

function initJobQueue(mongoClient) {
    const agenda = new Agenda({ ensureIndex: true, mongo: mongoClient._client.db('agenda') });

    agenda.define('scrape vypravenost', scrapeVypravenost);

    (async function() {
        await agenda.ready;
        agenda.processEvery('10 seconds');

        await agenda.start();
        // it does not actually...
        console.log('agenda started');

        await agenda.every('2 hours', 'scrape vypravenost');

        agenda.now('scrape vypravenost');
        console.log('should be scraping');
    })();

    jobQueue = agenda;
}

async function scrapeVypravenost(job) {
    // do some actual scraping
    console.log("doing scraping");
    const scrap = await scraper.getTrainsWith151();
    const mongoclient = mongo.getDBClient();
    // omg this is so bad, must make this nicer
    // also i don't think the scrapping is working as it should, sigh

    // i mean, the logic will need a change anyway as it cannot react to
    // the changes in the source data, which is going to happen, meh
    // this is not even a proof of concept really
    for (loco in scrap) {
	Object.keys(scrap[loco].days).forEach( key => {
		const day = key;
		for (train in scrap[loco].days[day]) {
			const filterQuery = {
				'date': { $eq: day },
				'shortName': loco,
				'train': train
			};

			mongoclient.trainList.replaceOne(
				filterQuery,
				{
					'train': scrap[loco].days[day][train],
					'shortName': loco,
					'date': day
				},
				{
					'upsert': true
				}
			).catch(err => {
				if (err.errorResponse.code === 11000) {
					// this is fine...
				} else {
					console.log('mongo failure: ' + err);
				}
			});
		}
        });
    }
    console.log("scrapping done");
}

module.exports = { initJobQueue, jobQueue, scrapeVypravenost };
