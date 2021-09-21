const { Page } = require('puppeteer-core')
const ElementSelector = require('../class/ElementSelector')
const findElement = require('./findElement')
const assert = require('assert')


/**
 * Check if the text from selected element equal to value specified
* @param {Page} page  
* @param {string} desiredText 
* @param {ElementSelector} elementSelector
 */
exports.testTextEqual = async function (page, elementSelector, desiredText) {

    /**
     * Use javascript to get text content
     */
    let element = await findElement(page, elementSelector)
    let currentText = await element.evaluate(el => el.textContent)
    //ensure text equal what we want
    assert.strictEqual(currentText, desiredText, `Current value for ${elementSelector.displayName} is ${currentText}. It's different from baseline ${desiredText}`)
    return currentText
}