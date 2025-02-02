const { MongoClient } = require("mongodb");
const fs = require('fs');

let client = undefined;

function initMongo() {
    if (process.env.BANAN_MONGO_STRING === undefined) {
        throw 'Mongo connection string not set in BANAN_MONGO_STRING';
    }

    const mongoClient = new MongoClient(process.env.BANAN_MONGO_STRING);
    const db = mongoClient.db('bananas');

    client = {
        '_client': mongoClient,
        'bananasDb': db,
        'locomotives': db.collection('locomotives'),
        'isInitialized': false
    }

    return client;
}

async function initData(client) {
    try {
        if (await client.locomotives.count() > 0) {
            console.log('More than one locomotive present, considering initialized');
            client.isInitialized = true;
            return true;
        }

        const locData = JSON.parse(fs.readFileSync('data/locomotives.json', encoding='utf-8'));

        await client.locomotives.insertMany(locData.list);

        client.isInitialized = true;
        return true;
    }
    catch (err) {
        console.error('Failed to populate data in Mongo ' + err);
    }

    return false;
}

function getDBClient() {
    if (client && client.isInitialized) {
        return client;
    }

    return undefined;
}

module.exports = { initMongo, initData, getDBClient };