const locator = require('../bluestone-locator')
const support = require('./support/support')
const Browser = require('puppeteer-core').Browser
const Page = require('puppeteer-core').Page
/**
 * Log Result    
 * @param {string} text1 the text info 1
 * @param {string} text2 the text info 2
 * @param {Browser} browser puppeteer page object
 * @param {Page} page puppeteer page object
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
 * @param {Browser} browser
 * @param {Page} page
 */
exports.testFunc = function (browser, page) {

    console.log('test func')
}