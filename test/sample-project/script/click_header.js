const locator = require('../bluestone-locator.js');
const projectFunc = require('../bluestone-func.js');
const puppeteer = require('puppeteer');
const bluestoneFunc = require('bluestone');
const config = require('../config.js');
describe('smoke test', () => {
    it('click header', async () => {
        let element, variable, frame;
        const browser = await puppeteer.launch(config.puppeteer);
        const page = await browser.newPage();
        frame = page;
        await bluestoneFunc.goto.func(frame, 'http://localhost:3000/site/singlePageHappyPath.html');
        await bluestoneFunc.waitElementExists.func(frame, locator['Header'], 3676);
        await bluestoneFunc.click.func(frame, locator['Header']);
    });
});