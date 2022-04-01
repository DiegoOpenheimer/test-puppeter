import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { run } from './services/crawling-web.js';
import http from 'http';

const readFile = promisify(fs.readFile);

const startDateParams = process.argv.find(arg => arg.startsWith('startDate='));

const { format } = new Intl.DateTimeFormat('pt-br');

const startDate = moment(startDateParams?.split('=')[1] || '2022-01-01').utc();

const nextMonth = moment().add(1, 'month').utc().endOf('month');

async function main() {
    let lastDate = startDate.clone().utc().endOf('month');
    try {
        let data;
        const rawData = await readFile(path.join(new URL('.', import.meta.url).pathname, 'data.json')).catch(_=>null);
        if (rawData) {
            data = JSON.parse(rawData.toString());
            const lastInfo = data[data.length - 1];
            lastDate = moment(lastInfo.period).clone().add(1, 'month').utc().endOf('month');
        }
        const initialPeriod = format(startDate?.toDate());
        const finalPeriod = format(lastDate?.toDate());
        if (lastDate.isSame(nextMonth)) {
            return false;
        }
        await run(initialPeriod, finalPeriod, data);
        await main();
    } catch (error) {
        console.log(error);
    }
};

const server = http.createServer(async (req, res) => {
    const url = req.url;
    if (url.includes('/hello')) {
        res.end('Hello World!');
        return
    }
    if (url.includes('/run')) {
        const beforeCrawling = new Date();
        await main();
        const timeInSeconds = (new Date() - beforeCrawling) / 1000;
        res.end(`Crawling finished in ${timeInSeconds} seconds`);
    }

});

server.listen(3000, () => console.log('Server running on port 3000'));