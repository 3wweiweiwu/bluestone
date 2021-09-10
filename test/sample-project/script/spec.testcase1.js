let locator = require('../bluestone-locator')
let func = require('../bluestone-func')
let puppeteer = require('puppeteer-core')
let { findElement } = require('../../../library')
let config = require('../config')

describe('test', () => {
    it('should run test1', async () => {
        let element = null
        const browser = await puppeteer.launch(config.puppeteer)
        const page = await browser.newPage();
        await page.goto(process.env.site || 'https://todomvc.com/examples/angularjs/#/');
        
        element = await findElement(browser, page, locator, 'Todo_Page/TODO_Text_Input', { timeout: 2000 })
        await element.type('hello')
        
        console.log(locator['Todo_Page/TODO_Text_Input'])

    }).timeout(8000)
})