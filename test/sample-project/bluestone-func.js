let locators = require('./bluestone-locator')
let func = require('./functions/logConsole')
module.exports = {
    logConsole: {
        func: func.LogConsole,
        locators: [locators.todoPage.todoText]
    }

}