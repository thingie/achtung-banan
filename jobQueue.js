const { Agenda } = require("agenda");
const mongo = require("./mongoClient");

let jobQueue = undefined;

function initJobQueue(mongoClient) {
    const agenda = new Agenda({ ensureIndex: true, mongo: mongoClient._client.db('agenda') });

    agenda.define('scrape vypravenost', scrapeVypravenost);

    (async function() {
        await agenda.ready;

        await agenda.start();

        await agenda.every('1 hour', 'scrape vypravenost');
    })();

    jobQueue = agenda;
}

async function scrapeVypravenost(job) {
    // do some actual scraping
    console.log("doing scraping");
    console.log(job);
}

module.exports = { initJobQueue, jobQueue };