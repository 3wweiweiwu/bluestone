const locator = require('..\\bluestone-locator')
const projectFunc = require('../bluestone-func')
const puppeteer = require('puppeteer-core')
const bluestoneFunc = require('../../../ptLibrary/bluestone-func')
const config = require('../config')

describe('test', () => {
    it('should run test1', async () => {
        let element, variable
        const browser = await puppeteer.launch(config.puppeteer)
        const page = await browser.newPage();

        await bluestoneFunc.goto.func(page, process.env.site || 'https://todomvc.com/examples/angularjs/#/');
        await bluestoneFunc.waitElementExists.func(page, locator['Todo_Page/TODO_Text_Input'], 3000)
        await bluestoneFunc.change.func(page, locator['Todo_Page/TODO_Text_Input'], 'hello world')
        await bluestoneFunc.keydown.func(page, 'Enter')
        await projectFunc.logConsole.func(browser, page, 'hello1', 'hello2')
    }).timeout(8000)
})