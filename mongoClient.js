const { MongoClient } = require("mongodb");
const fs = require('fs');

function initMongo() {
    if (process.env.BANAN_MONGO_STRING === undefined) {
        throw 'Mongo connection string not set in BANAN_MONGO_STRING';
    }

    const client = new MongoClient(process.env.BANAN_MONGO_STRING);
    const db = client.db('bananas');

    return { 
        '_client': client,
        'bananasDb': db,
        'locomotives': db.collection('locomotives')
    }
}

async function initData(client) {
    try {
        if (await client.locomotives.count() > 0) {
            console.log('More than one locomotive present, considering initialized');
            return true;
        }

        const locData = JSON.parse(fs.readFileSync('data/locomotives.json', encoding='utf-8'));

        await client.locomotives.insertMany(locData.list);
    }
    catch (err) {
        console.error('Failed to populate data in Mongo ' + err);
    }

    return false;
}

module.exports = { initMongo, initData };