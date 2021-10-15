let locators = require('./bluestone-locator')
let func = require('./functions/logConsole')
module.exports = {

    logConsole: {
        func: func.failedFunction,
        locators: []
    },
    notActiveFunc: {
        func: func.testFunc,
        locators: []
    }

}