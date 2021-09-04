let locator = require('../bluestone-locator')
let func = require('../bluestone-func')
describe('test', () => {
    it('should run test1', () => {
        console.log(locator.todoPage.todoText.locators)
        func.logConsole.func('hello1', 'hello2')
    })
})