const locator = require('../bluestone-locator')
const support = require('./support/support')
const { Browser, Page, ElementHandle } = require('puppeteer-core')
const assert = require('assert')
/**
 * Failed Function Sample - this function will throw error    
 * @param {string} text1 the text info 1
 * @param {string} text2 the text info 2
 * @param {Browser} browser puppeteer page object
 * @param {Page} page puppeteer page object
 * 
 */
exports.failedFunction = async function (browser, page, text1, text2) {
    //inline comment within logConsole function
    console.log(`text1:${text1} text2:${text2}`)
    /**
     * @type {string}
     */
    let str
    support.support('hello')
}

/**
 * test if current text match specific pattern
 * @param {Browser} browser
 * @param {Page} page
 * @param {ElementHandle} element 
 * @param {string} pattern 
 */
exports.isMatchTextPattern = async function (browser, page, element, pattern) {
    /**@type {string} */
    let value = await element.getProperty('value')
    if (value == null) {
        value = await page.evaluate(el => el.textContent, element)
    }
    if (value.includes(pattern)) {
        assert.ok('pattern matched')
    }
    else {
        assert.fail('pattern not matched')
    }

}