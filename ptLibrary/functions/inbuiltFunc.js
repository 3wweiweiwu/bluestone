const { Page, Frame } = require('puppeteer-core')
const ElementSelector = require('../class/ElementSelector')
const findElement = require('./findElement')
const assert = require('assert')


/**
 * Test current text equal to desired value
* @param {Frame} frame  
* @param {string} desiredText The desired text value
* @param {ElementSelector} elementSelector
 */
exports.testTextEqual = async function (frame, elementSelector, desiredText) {

    /**
     * Use javascript to get text content
     */
    let element = await findElement(frame, elementSelector, 2000)
    let currentText = await element.evaluate(el => el.textContent)
    //ensure text equal what we want
    assert.strictEqual(currentText, desiredText, `Current value for ${elementSelector.displayName} is ${currentText}. It's different from baseline ${desiredText}`)
    return `Current value "${currentText}"" match baseline`
}

/**
 * Wait element exists
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time in ms. If no element appear within this period, an error will be thrown
 * @returns {ElementHandle}
 */
exports.waitElementExists = async function (frame, elementSelector, timeout) {
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
                let elementResult
                try {
                    elementResult = await frame.$x(locator)
                } catch (error) {
                    continue
                }

                if (elementResult.length > 0) element = elementResult[0]
            }
            else {
                //selector
                try {
                    element = await frame.$(locator)
                } catch (error) {
                    continue
                }

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

/**
 * change value in text input
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {string} text Text value you want to change to
 * @returns {ElementHandle}
 */
exports.change = async function (frame, elementSelector, text) {
    let element = await findElement(frame, elementSelector, 2000)
    await element.type(text, { delay: 100 })

    return `Type value ${text} success!`

}

/**
 * Click UI element
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 */
exports.click = async function (frame, elementSelector) {
    let element = await findElement(frame, elementSelector, 2000)
    try {
        await element.click()
    } catch (error) {
        return Promise.reject(`Unable to click ${elementSelector.displayName}`)
    }

    return `Click success!`
}
/**
 * Navigate browser to he url
 * @param {Frame} page 
 * @param {string} url 
 * @returns 
 */
exports.goto = async function (page, url) {
    await page.goto(url)


    return `Goto ${url} success!`

}

/**
 * Go to specific iframe component
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 */
exports.gotoFrame = async function (frame, elementSelector) {
    let element = await findElement(frame, elementSelector, 2000)
    try {
        frame = await element.contentFrame()
        return frame
    } catch (error) {
        return Promise.reject(`Unable to go to frame ${elementSelector.displayName}`)
    }
}

/**
 * Press a key
*  @param {Frame} frame 
 * @param {string} key button you want to press. Supported Button: Enter|Tab|Escape
 */
exports.keydown1 = async function (frame, key) {

    switch (key) {
        case 'Enter':
            await frame.keyboard.press("Enter")
            break;
        case "Tab":
            await frame.keyboard.press("Tab")
            break
        case "Escape":
            await frame.keyboard.press("Escape")
            break
        default:
            break;
    }
    return `Click success!`
}