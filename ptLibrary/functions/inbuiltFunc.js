const { Page } = require('puppeteer-core')
const ElementSelector = require('../class/ElementSelector')
const findElement = require('./findElement')
const assert = require('assert')


/**
 * Test current text equal to desired value
* @param {Page} page  
* @param {string} desiredText The desired text value
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
    return `Current value "${currentText}"" match baseline`
}

/**
 * Wait element exists
*  @param {Page} page 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time in ms. If no element appear within this period, an error will be thrown
 * @returns {ElementHandle}
 */
exports.waitElementExists = async function (page, elementSelector, timeout) {
    /**@type {Array<string>} */
    let throwError = true
    let locatorOptions = elementSelector.locator
    //find locator option within timeout
    let startTime = Date.now()
    /**@type {ElementHandle} */
    let element = null
    let timeSpan = 0
    do {
        for (let i = 0; i < locatorOptions.length; i++) {
            let locator = locatorOptions[i]

            if (locator.startsWith('/')) {
                //xpath
                let elementResult = await page.$x(locator)
                if (elementResult.length > 0) element = elementResult[0]
            }
            else {
                //selector
                element = await page.$(locator)
            }
            if (element != null) {
                break
            }

        }
        let currentTime = Date.now()
        timeSpan = currentTime - startTime
    } while (timeSpan < timeout && element == null);

    if (element == null) {
        let info = `Unable to find UI element:${elementSelector.displayName} in ${timeout}ms`
        if (throwError) {
            return Promise.reject(info)
        }
        else {
            console.log(info)
        }

    }

    return element

}