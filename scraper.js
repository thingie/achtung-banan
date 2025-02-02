axios = require('axios');
cheerio = require('cheerio');

// yeah, shameless, I mean, have to get the data somewhere

const urls = {
    'group351_2025': "https://sledovani.55p.cz/decin_351_2025/"
}

async function getTrainsWith151() {
    let trains = [];
    for (url in urls) {
        let data;
        try {
            data = await axios.get(urls[url]);
        } catch (err) {
            console.log("Failed to fetch the source data " + err);
            return trains;
        }
        const c = cheerio.load(data.data);

        let ts = {};
        let locos = {};

        c('h1 + table').find('tr').each(
            (idx, ref) => {
                if (idx === 0) {
                    // header row identifying the TS's we're working with
                    const headerSize = c(ref).find('th').length;
                    let count = 0;
                    let rowsSoFar = 0;
                    c(ref).find('th').each((tidx, tref) => {
                        if (tidx === 0 || tidx === (headerSize - 1)) { 
                            return; // we don't care
                        }
                        const elem = c(tref);
                        let newElem = { 'days': parseInt(elem.attr().colspan) };
                        newElem.order = count;
                        newElem.dayNumbers = [];
                        newElem.trainDays = {};
                        count += 1;

                        for (i = 0; i < newElem.days; i++) {
                            newElem.dayNumbers.push(rowsSoFar + i);
                        }
                        rowsSoFar = rowsSoFar + newElem.days;

                        ts[elem.text()] = newElem;
                    })
                }

                if (idx === 1) {
                    // this one doesn't matter to us now
                    return;
                }

                if (idx === 2) {
                    // but this one does, it's a list of trains for the TS
                    const headerSize = c(ref).find('th').length;

                    c(ref).find('th').each((tidx, tref) => {
                        if (tidx === 0 || tidx === (headerSize - 1)) { 
                            return; // we don't care, same here
                        }
                        const elem = c(tref);
                        if (elem.text() === "-") {
                            return;
                        }

                        // need to identify the TS
                        let myTs = undefined;
                        for (n in ts) {
                            if ((myDayInTs = ts[n].dayNumbers.find(k =>  k === (tidx - 1))) !== undefined) {
                                myTs = n;
                                break;
                            }
                        }

                        ts[myTs]['trains'] = elem.text().split('/');
                        ts[myTs]['trainDays'][myDayInTs] = elem.text().split('/');
                    });
                }

                if (idx > 2) {
                    // this is probably a data row, now the fun begins
                    // same logic as before, nothing we care 
                    const headerSize = c(ref).find('td').length;
                    const year = new Date().getFullYear();
                    let day;
                    c(ref).find('td').each((tidx, tref) => {
                        const elem = c(tref);
                        if (tidx === 0) {
                            // we do care now, this is our date
                            const d = c(tref).text();
                            // i got this one from chatgpt, sorry bros, i understand it
                            // after reading but i am not wasting my life writing it
                            const regex = /^[\p{L}\p{M}]{2} (\d+)\.\s(\d+)\.$/u;
                            const m = regex.exec(d);
                            if (m !== null) {
                                day = new Date(year, m[2] - 1, m[1]);
                            }
                        }
                        if (tidx === (headerSize - 1)) { 
                            return; // we don't care
                        }

                        // all the rest should be our loco
                        let myTs = undefined;
                        let myDayInTs = undefined;
                        for (n in ts) {
                            if ((myDayInTs = ts[n].dayNumbers.find(k =>  k === (tidx - 1))) !== undefined) {
                                myTs = n;
                                break;
                            }
                        }

                        // now look for locos
                        const regex = /(\d{3}\.\d{3})/g;
                        let l = [];
                        let m;
                        while ((m = regex.exec(elem.text())) !== null) {
                            l.push(m[1]);
                        }
                        if (l.length === 0) {
                            return;
                        }
                        for (loco in l) {
                            if (l[loco].startsWith('151')) {
                                if (locos[l[loco]] === undefined) {
                                    locos[l[loco]] = {days: {}};
                                }

                                locos[l[loco]].days[day] = ts[myTs].trainDays[myDayInTs];
                            }
                        }

                    });
                }
            }
        );


        // returning { 'loconumber': { days: [ train, train, train ] } }
        return locos;
    }
}

getTrainsWith151();

module.exports = { getTrainsWith151 };