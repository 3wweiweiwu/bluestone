let inbuiltFunc = require('./functions/inbuiltFunc')
module.exports = {

    testTextEqual: {
        func: inbuiltFunc.testTextEqual,
        locators: [{ locator: ['invalid_locator'] }]
    },

    waitElementExists: {
        func: inbuiltFunc.waitElementExists,
        locators: [{ locator: ['invalid_locator'] }]
    },
    change: {
        func: inbuiltFunc.change,
        locators: [{ locator: ['invalid_locator'] }]
    },
    click: {
        func: inbuiltFunc.click,
        locators: [{ locator: ['invalid_locator'] }]
    },
    goto: {
        func: inbuiltFunc.goto,
        locators: [{ locator: ['invalid_locator'] }]
    },
    keydown: {
        func: inbuiltFunc.keydown,
        locators: [{ locator: ['invalid_locator'] }]
    },

}