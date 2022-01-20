let inbuiltFunc = require('./functions/inbuiltFunc')
let BluestoneFunc = require('./class/BluestoneFunc')
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
    waitElementExists: new BluestoneFunc(inbuiltFunc.waitElementExists),
    change: new BluestoneFunc(inbuiltFunc.change),
    click: new BluestoneFunc(inbuiltFunc.click),
    goto: new BluestoneFunc(inbuiltFunc.goto),
    keydown: new BluestoneFunc(inbuiltFunc.keydown1),
    gotoFrame: new BluestoneFunc(inbuiltFunc.gotoFrame),
    closeBrowser: new BluestoneFunc(inbuiltFunc.closeBrowser),
    upload: new BluestoneFunc(inbuiltFunc.uploadByInput),
    waitForTimeout: new BluestoneFunc(inbuiltFunc.waitForTimeout),
    basicAuthenticate: new BluestoneFunc(inbuiltFunc.basicAuthenticate),
    clearBrowserCache:new BluestoneFunc(inbuiltFunc.clearBrowserCache)

}