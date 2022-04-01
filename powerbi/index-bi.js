import puppeter from 'puppeteer';

const LINK = 'https://app.powerbi.com/view?r=eyJrIjoiNjc4OGYyYjQtYWM2ZC00YjllLWJlYmEtYzdkNTQ1MTc1NjM2IiwidCI6IjQwZDZmOWI4LWVjYTctNDZhMi05MmQ0LWVhNGU5YzAxNzBlMSIsImMiOjR9';

const selector = '.explorationContainer .exploreCanvas .visualContainer.paddingDisabled .visual, .explorationContainer .exploreCanvas .visualContainer.paddingDisabled .visualTitle, .explorationContainer .exploreCanvas .visualContainerGroup.paddingDisabled .visual, .explorationContainer .exploreCanvas .visualContainerGroup.paddingDisabled .visualTitle';

function waitElement(page, selector) {
    return page.waitForSelector(selector, { timeout: 10000 });
}

(async () => {
    console.time('start');
    const browser = await puppeter.launch({
        headless: true,
    });
    try {
        const page = await browser.newPage();
        await page.goto(LINK);
        const element = await waitElement(page, selector);
        await page.waitForTimeout(1000);
        const boundingBox = await element.boundingBox();
        await page.mouse.click(boundingBox.x + 10, boundingBox.y + 10);
        await waitElement(page, '.floatingBodyCells');
        const result = await page.evaluate(() => {
            const values = [];
            const bodyCells = document.querySelector('.floatingBodyCells');
            const elements = bodyCells?.childNodes?.[0]?.childNodes?.[0]?.childNodes
            elements?.forEach(element => values.push(element.innerText));
            return values;
        })
        console.log('RESULT: ', result);
    } catch (error) {
        console.log(error);
    } finally {
        await browser.close();
    }
    console.timeEnd('start');
})();
