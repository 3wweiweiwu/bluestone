const { Page, Frame, ElementHandle, Browser } = require('puppeteer-core')
const ElementSelector = require('../class/ElementSelector')
const findElement = require('./findElement')
const assert = require('assert')
const path = require('path')
const ConstantVar = {
    parentIFrameLocator: 'TOP IFRAME'
}

exports.VAR = ConstantVar

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
 * element exists
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time in ms. If no element appear within this period, an error will be thrown
 * @returns {ElementHandle}
 */
exports.waitElementExists = async function (frame, elementSelector, timeout) {
    let element = await findElement(frame, elementSelector, timeout, { throwError: true })
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
 * Wait till element visible
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time in ms.
 */
exports.waitTillElementVisible = async function (frame, elementSelector, timeout) {
    let itemVisible = false
    let startTime = Date.now()
    let timeSpan = 0
    do {
        let element = await findElement(frame, elementSelector, timeout)
        let rect = await element.evaluate(node => node.getBoundingClientRect())
        if (rect.width > 0 && rect.height > 0) {
            itemVisible = true
            break
        }
        timespan = Date.now() - startTime
    }
    while (timeSpan < timeout)
    if (itemVisible) {
        return 'Element is visible'
    }
    else {
        assert.fail(`${elementSelector.displayName} is not visible within ${timeout} ms`)
    }

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
 * Hover Mouse on Element
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 */
exports.hover = async function (frame, elementSelector) {
    let element = await findElement(frame, elementSelector, 2000)
    try {
        await element.hover()
    } catch (error) {
        return Promise.reject(`Unable to hover ${elementSelector.displayName}`)
    }
    return 'hover success!'
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
 * @param {Page} page
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 */
exports.gotoFrame = async function (page, frame, elementSelector) {
    //if current page locator is iframe, we will just go back to the top page
    if (elementSelector.locator == ConstantVar.parentIFrameLocator) {
        return page
    }
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

/**
 * Close Browser
*  @param {Browser} browser 
 */
exports.closeBrowser = async function (browser) {
    //will not quit browser if we are in bluestone simlation env
    if (process.env.BLUESTONE_SIMULATOR)
        return 'Browser will on be closed in real puppeteer script execution'

    await browser.close()
    return `Closed`
}

/**
 * Upload Files
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {string} uploadPathes Path to files you want to upload. You can seperate multiple files by ",".Ex: "c:\temp\a.jpg,c:\temp\b.j.jpg"
 */
exports.uploadByInput = async function upload(frame, elementSelector, uploadPathes) {
    /**@type {ElementHandle} */
    let element = await findElement(frame, elementSelector, 2000)

    let className = await element.evaluate(node => node.nodeName)
    let typeName = await element.evaluate(node => node.getAttribute('type'))
    let inputElement = element
    //search through the page to find 
    if (className != 'INPUT' || typeName != 'file') {
        let parentElement = element

        while (true) {
            parentElement = (await parentElement.$x('..'))[0]

            let potentialInputElements = await parentElement.$x('.//input[@type="file"]')
            if (potentialInputElements.length == 1) {
                inputElement = potentialInputElements[0]
                break
            }
            else if (potentialInputElements.length > 1) {
                return Promise.reject(`Too many file upload inputs. Please try different item`)
            }


        }

    }
    /**@type {string[]} */
    let pathList = uploadPathes.split(',')
    let mappedPath = pathList.map(fullPath => {
        return path.relative(process.cwd(), fullPath);
    })
    try {

        await inputElement.uploadFile(...mappedPath)
        await inputElement.evaluate(upload => upload.dispatchEvent(new Event('change', { bubbles: true })));
    } catch (error) {
        return Promise.reject(`Unable to Upload ${elementSelector.displayName}. Message:"${error.message}"`)
    }

    return `Upload Success!`
}
