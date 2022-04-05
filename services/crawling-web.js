import puppeter from 'puppeteer';
import { extractData } from './extract-data.js';

const LINK = 'https://tableau.ons.org.br/t/ONS_Publico/views/GeraodeEnergia/HistricoGeraodeEnergia?%3Aembed=y&%3AshowAppBanner=false&%3AshowShareOptions=true&%3Adisplay_count=no&%3AshowVizHome=no';

const withDelay = process.argv.some(arg => arg === '--delay');

const persist = process.argv.find(arg => arg === '--persist');

const dev = process.argv.some(arg => arg === '--dev');

async function delay() {
    if (!withDelay) {
        return;
    }
    return new Promise(resolve => setTimeout(resolve, 1000));
}

function waitElement(page, selector) {
    return page.waitForSelector(selector, { timeout: 10000 });
}

async function waitElementAndClick(page, selector) {
    await waitElement(page, selector);
    await page.click(selector);
}

async function changeFilterDate(page, startDate, endDate) {
    await waitElement(page, 'input[aria-label="Início"]'),
    await waitElement(page, 'input[aria-label="Fim"]'),
    await page.evaluate((startDate, endDate) => {
        document.querySelector('input[aria-label="Início"]').value = startDate;
        document.querySelector('input[aria-label="Fim"]').value = endDate;
    }, startDate, endDate);
    await waitElementAndClick(page, '#refresh-ToolbarButton');
}

export async function run(startDate, endDate, data) {
    console.log(`Consultando range de ${startDate} até ${endDate}`);
    const browser = await puppeter.launch({
        headless: !dev,
        defaultViewport: null,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox']
    });
    console.log('Abrindo navegador');
    try {
        console.log('Abrindo page');
        const page = await browser.newPage();
        console.log('Aguardando configuração');
        await page._client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: `./${persist ? endDate.split('/').join('-') : ''}` })
        console.log('Abrindo link');
        await page.goto(LINK);
        console.log('Aguardando network');
        await page.waitForNetworkIdle();
        console.log('Aguardando componente');
        await waitElementAndClick(page, 'div[data-tb-test-id="tabStoryPoint-4"]');
        await delay();
        console.log('Aguardando network');
        await page.waitForNetworkIdle();
        await delay();
        await changeFilterDate(page, startDate, endDate);
        await delay();
        await page.waitForNetworkIdle();
        await delay();
        console.log('Aguardando componente');
        await waitElementAndClick(page, '#download-ToolbarButton')
        await delay();
        console.log('Aguardando componente');
        await waitElementAndClick(page, 'button[data-tb-test-id="DownloadCrosstab-Button"]')
        await delay();
        console.log('Aguardando componente');
        await waitElementAndClick(page, 'div[data-tb-test-id="sheet-thumbnail-1"]')
        await delay();
        console.log('Aguardando componente');
        await waitElementAndClick(page, 'button[data-tb-test-id="export-crosstab-export-Button"]')
        await delay();
        console.log('Aguardando network');
        await page.waitForNetworkIdle();
        await extractData(endDate, data, persist);
    } catch (error) {
        console.log(error);
    } finally {
        await browser.close();
    }
}
