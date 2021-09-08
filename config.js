const path = require('path')
module.exports = {
    puppeteer: {
        "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        defaultViewport: null
    },
    code: {
        funcPath: path.join(__dirname, './test/sample-project/bluestone-func.js'),
        locatorPath: path.join(__dirname, './test/sample-project/bluestone-locator.js'),
        scriptFolder: path.join(__dirname, './test/sample-project/script'),
    }

}