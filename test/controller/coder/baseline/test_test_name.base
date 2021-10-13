const locator = require('../../sample-project/bluestone-locator.js');
const projectFunc = require('../../sample-project/bluestone-func.js');
const puppeteer = require('../../../puppeteer-core');
const bluestoneFunc = require('../../../ptLibrary/bluestone-func.js');
const config = require('../../sample-project/config.js');
describe('test suite name', () => {
    it('test test name', async () => {
        let element, variable;
        const browser = await puppeteer.launch(config.puppeteer);
        const page = await browser.newPage();
        await bluestoneFunc.goto.func(page, 'https://todomvc.com/examples/angularjs/#/');
        await bluestoneFunc.waitElementExists.func(page, locator['Todo_Page/TODO_Text_Input'], 12997);
        await bluestoneFunc.click.func(page, locator['Todo_Page/TODO_Text_Input']);
        await bluestoneFunc.waitElementExists.func(page, locator['Todo_Page/TODO_Text_Input'], 2271);
        await bluestoneFunc.keydown.func(page, 'Enter');
        await bluestoneFunc.waitElementExists.func(page, locator['Todo_Page/TODO_Text_Input'], 2415);
        await bluestoneFunc.change.func(page, locator['Todo_Page/TODO_Text_Input'], 'hello world!');
        await bluestoneFunc.waitElementExists.func(page, locator['txtTodoItem'], 158);
        await bluestoneFunc.testTextEqual.func(page, locator['txtTodoItem'], 'hello world!');
        await projectFunc.logConsole.func(browser, page, 'test1', 'test2');
    });
});