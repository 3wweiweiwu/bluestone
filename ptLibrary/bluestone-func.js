let inbuiltFunc = require('./functions/inbuiltFunc')
module.exports = {

    testTextEqual: {
        func: inbuiltFunc.testTextEqual,
        locators: [{ locator: ['invalid_locator'] }]
    }

}