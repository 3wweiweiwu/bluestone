const locator = require('../bluestone-locator.js');
const projectFunc = require('../bluestone-func.js');
const puppeteer = require('puppeteer');
const bluestoneFunc = require('bluestone/ptLibrary/bluestone-func');
const config = require('../config.js');
describe('test1', () => {
    it('sdf1', async () => {
        let element, variable, frame;
        const browser = await puppeteer.launch(config.puppeteer);
        const page = await browser.newPage();
        let vars = { currentFileName: __filename };
        frame = page;
        await bluestoneFunc.goto.func(frame, 'https://todomvc.com/examples/angularjs/#/');
        await bluestoneFunc.waitElementExists.func(frame, locator['ss'], 15673);
        await bluestoneFunc.waitElementExists.func(frame, locator['ss'], 15673);
        await bluestoneFunc.change.func(frame, locator['ss'], 'hello world');
        await bluestoneFunc.click.func(frame, locator['ss']);
        await bluestoneFunc.keydown.func(frame, 'Enter');
        await bluestoneFunc.click.func(frame, locator['1st Selector']);
        await bluestoneFunc.waitElementExists.func(frame, locator['sdf'], 14549);
        await bluestoneFunc.click.func(frame, locator['sdf']);
    }).timeout(6000);
});