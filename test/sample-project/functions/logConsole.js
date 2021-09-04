const locator = require('../bluestone-locator')
const support = require('./support/support')
/**
 * Log Result    
 * @param {string} text1 
 * @param {string} text2 
 * @param {import('puppeteer-core').Browser} browser
 * @param {import('puppeteer-core').Page} page
 * @requires locator.todoPage.todoText
 * 
 */
exports.LogConsole = function (browser, page, text1, text2) {
    //inline comment within logConsole function
    console.log(`text1:${text1} text2:${text2}`)
    /**
     * @type {string}
     */
    let str
    support.support('hello')
}

/**
 * test function
 * @param {import('puppeteer-core').Browser} browser
 * @param {import('puppeteer-core').Page} page
 */
exports.testFunc = function (browser, page) {

    console.log('test func')
}