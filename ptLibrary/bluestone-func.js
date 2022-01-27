let inbuiltFunc = require('./functions/inbuiltFunc')
let BluestoneFunc = require('./class/BluestoneFunc')



module.exports = {

    testTextEqual: class {
        static func = inbuiltFunc.testTextEqual
        static locators = ['invalid_locators']
    },
    hover: class {
        static func = inbuiltFunc.hover
        static locators = ['invalid_locators']
    },
    waitElementVisible: class {
        static func = inbuiltFunc.waitTillElementVisible
        static locators = ['invalid_locators']
    },
    waitElementExists: class {
        static func = inbuiltFunc.waitElementExists
        static locators = ['invalid_locators']
    },
    change: class {
        static func = inbuiltFunc.change
        static locators = ['invalid_locators']
    },
    click: class {
        static func = inbuiltFunc.click
        static locators = ['invalid_locators']
    },
    goto: class {
        static func = inbuiltFunc.goto
        static locators = ['invalid_locators']
    },
    keydown: class {
        static func = inbuiltFunc.keydown1
        static locators = ['invalid_locators']
    },
    gotoFrame: class {
        static func = inbuiltFunc.gotoFrame
        static locators = ['invalid_locators']
    },
    closeBrowser: class {
        static func = inbuiltFunc.closeBrowser
        static locators = ['invalid_locators']
    },
    upload: class {
        static func = inbuiltFunc.uploadByInput
        static locators = ['invalid_locators']
    },
    waitForTimeout: class {
        static func = inbuiltFunc.waitForTimeout
        static locators = ['invalid_locators']
    },
    basicAuthenticate: class {
        static func = inbuiltFunc.basicAuthenticate
        static locators = ['invalid_locators']
    },
    clearBrowserCache: class {
        static func = inbuiltFunc.clearBrowserCache
        static locators = ['invalid_locators']
    }

}