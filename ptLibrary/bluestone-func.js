let inbuiltFunc = require('./functions/inbuiltFunc')
let BluestoneFunc = require('./class/BluestoneFunc')
let WaitForElementUnblocked = require('./functions/waitElementUnblocked')


module.exports = {
    clearBrowserCache: new inbuiltFunc.clearBrowserCache(),
    launchBrowser: new inbuiltFunc.launchBrowser(),
    testTextEqual: class {
        static func = inbuiltFunc.testTextEqual
        static locators = [{ locator: ['invalid_locator'] }]
    },
    hover: class {
        static func = inbuiltFunc.hover
        static locators = [{ locator: ['invalid_locator'] }]
    },
    waitElementVisible: class {
        static func = inbuiltFunc.waitTillElementVisible
        static locators = [{ locator: ['invalid_locator'] }]
    },
    waitElementExists: class {
        static func = inbuiltFunc.waitElementExists
        static locators = [{ locator: ['invalid_locator'] }]
    },
    change: class {
        static func = inbuiltFunc.change
        static locators = [{ locator: ['invalid_locator'] }]
    },
    click: class {
        static func = inbuiltFunc.click
        static locators = [{ locator: ['invalid_locator'] }]
    },
    goto: class {
        static func = inbuiltFunc.goto
        static locators = [{ locator: ['invalid_locator'] }]
    },
    keydown: class {
        static func = inbuiltFunc.keydown1
        static locators = [{ locator: ['invalid_locator'] }]
    },
    gotoFrame: class {
        static func = inbuiltFunc.gotoFrame
        static locators = [{ locator: ['invalid_locator'] }]
    },
    closeBrowser: class {
        static func = inbuiltFunc.closeBrowser
        static locators = [{ locator: ['invalid_locator'] }]
    },
    upload: class {
        static func = inbuiltFunc.uploadByInput
        static locators = [{ locator: ['invalid_locator'] }]
    },
    waitForTimeout: class {
        static func = inbuiltFunc.waitForTimeout
        static locators = [{ locator: ['invalid_locator'] }]
    },
    basicAuthenticate: class {
        static func = inbuiltFunc.basicAuthenticate
        static locators = [{ locator: ['invalid_locator'] }]
    },
    dragstart: class {
        static func = inbuiltFunc.dragstart
        static locators = [{ locator: ['invalid_locator'] }]
    },
    drop: class {
        static func = inbuiltFunc.drop
        static locators = [{ locator: ['invalid_locator'] }]
    },
    initialize: class {
        static func = inbuiltFunc.initialize
        static locators = [{ locator: ['invalid_locator'] }]
    },
    waitForDownloadComplete: class {
        static func = inbuiltFunc.waitForDownloadComplete
        static locators = [{ locator: ['invalid_locator'] }]
    },
    waitAndHandleForAlert: class {
        static func = inbuiltFunc.waitAndHandleAlert
        static locators = [{ locator: ['invalid_locator'] }]
    },
    scroll: class {
        static func = inbuiltFunc.scroll
        static locators = [{ locator: ['invalid_locator'] }]
    },
    getStyleAttribute: class {
        static func = inbuiltFunc.getStyleAttribute
        static locators = [{ locator: ['invalid_locator'] }]
    },
    mouseDown: class {
        static func = inbuiltFunc.mouseDown
        static locators = [{ locator: ['invalid_locator'] }]
    },
    mouseUp: class {
        static func = inbuiltFunc.mouseUp
        static locators = [{ locator: ['invalid_locator'] }]
    },
    switchTab: class {
        static func = inbuiltFunc.switchTab
        static locators = [{ locator: ['invalid_locator'] }]
    },
    scrollElementToMidview: new inbuiltFunc.scrollElementToMidview(),
    waitElementUnblocked: new WaitForElementUnblocked.funcClass(),
}