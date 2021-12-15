const ElementSelector = require('../class/ElementSelector')
const { Browser, Page, ElementHandle } = require('puppeteer-core')
const Options = {
    /** @type {boolean} if no element is found, should we throw error?*/
    throwError: false,
}
/**
 * Find a element within timeout period. If no element is found, a error will be thrown
*  @param {Page} page 
 * @param {ElementSelector} elementSelector element selector object
 * @param {Options} option 
 * @param {number} timeout wait time in ms
 * @returns {ElementHandle}
 */
module.exports = async function (page, elementSelector, timeout, option = Options) {
    /**@type {Array<string>} */
    let locatorOptions = elementSelector.locator
    //find locator option within timeout
    let startTime = Date.now()
    /**@type {ElementHandle} */
    let element = null
    let timeSpan = 0
    do {

        try {
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
        } catch (error) {

        }
        let currentTime = Date.now()
        timeSpan = currentTime - startTime
        if (element != null) {
            let clientHeight = await element.evaluate(node => node.clientHeight)
            if (clientHeight != 0) {
                break
            }
        }
    } while (timeSpan < timeout);

    if (element == null) {
        let info = `Unable to find UI element:${elementSelector.displayName} in ${timeout}ms`
        if (option.throwError) {
            return Promise.reject(info)
        }
        else {
            console.log(info)
        }

    }

    return element

}