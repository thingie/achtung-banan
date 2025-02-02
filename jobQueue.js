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
    for (loco in scrap) {
        console.log("Locomotive " + loco + " was seen on following day")
        for (day in scrap[loco].days) {
            console.log(scrap[loco].days[day].toDateString());
        }
    }
    console.log(job);
}

module.exports = { initJobQueue, jobQueue };