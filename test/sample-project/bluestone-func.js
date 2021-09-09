let locators = require('./bluestone-locator')
let func = require('./functions/logConsole')
module.exports = {

    logConsole: {
        func: func.LogConsole,
        locators: [locators['Todo_Page/TODO_Text_Input'], locators['Todo_Page/todoText2']]
    }

}