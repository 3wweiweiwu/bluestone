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
}