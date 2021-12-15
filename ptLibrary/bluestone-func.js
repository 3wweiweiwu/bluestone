let inbuiltFunc = require('./functions/inbuiltFunc')
module.exports = {

    testTextEqual: {
        func: inbuiltFunc.testTextEqual,
        locators: [{ locator: ['invalid_locator'] }]
    },
    hover: {
        func: inbuiltFunc.hover,
        locators: [{ locator: ['invalid_locator'] }]
    },
    waitElementVisible: {
        func: inbuiltFunc.waitTillElementVisible,
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
        func: inbuiltFunc.keydown1,
        locators: [{ locator: ['invalid_locator'] }]
    },
    gotoFrame: {
        func: inbuiltFunc.gotoFrame,
        locators: [{ locator: ['invalid_locator'] }]
    }

}