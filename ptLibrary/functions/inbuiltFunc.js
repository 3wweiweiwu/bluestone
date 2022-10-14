const { Page, Frame, ElementHandle, Browser } = require('puppeteer-core')
const HealingSnapshot = require('../class/HealingSnapshot')
const ElementSelector = require('../class/ElementSelector')
const VarSaver = require('../class/VarSaver')
const findElement = require('./findElement')
const puppeteer = require('puppeteer')
const initailizeDownload = require('./initialization/initiailzeDownload')
const initailizeAlertHandle = require('./initialization/initializeAlertHandle')
const initializeFolder = require('./initialization/initializeFolder')
const { initializePageCapture } = require('./snapshotCapture')
const assert = require('assert')
const path = require('path')
const BluestoneFunc = require('../class/BluestoneFunc')
const BluestoneType = require('../class/index')
const TestcaseLoader = require('../../controller/ast/TestCaseLoader')
const getCurrentUrl = require('./getCurrentUrl')
const ConstantVar = {
    parentIFrameLocator: 'TOP IFRAME'
}

exports.VAR = ConstantVar

exports.launchBrowser = class extends BluestoneFunc {
    /**
     * Launch Browser
     * @param {Object} puppeteerCofnig puppeteer Config
     */
    async func(config) {

        let browser = await puppeteer.launch(config);
        return browser
    }
    constructor() {
        super()
    }
}
exports.clearBrowserCache = class extends BluestoneFunc {
    /**
     * Clear browser cache
     * @param {Page} page 
     */
    async func(page) {
        try {
            const client = await page.target().createCDPSession();
            await client.send('Network.clearBrowserCookies');
            await client.send('Network.clearBrowserCache');
            await page.evaluate(() => { localStorage.clear() })
        } catch (error) {

        }

        return true
    }
    constructor() {
        super()
    }
}


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
    let currentText = await element.evaluate(el => el.value || el.textContent)
    //removing escape characters in the event a higher level locator has to be used
    currentText = currentText.trim()
    //removing escape characters from desiredtext in the even the removed whitespace from currenttext was supposed to be there
    desiredText = desiredText.trim()
    //ensure text equal what we want
    assert.strictEqual(currentText, desiredText, `Current value for ${elementSelector.displayName} is ${currentText}. It's different from baseline ${desiredText}`)
    return `Current value "${currentText}"" match baseline`
}


const thisWaitElementExists = async function (frame, elementSelector, timeout, healingSnapshot) {
    let element = await findElement(frame, elementSelector, timeout, { throwError: true, isHealingByLocatorBackup: true, takeSnapshot: true }, healingSnapshot)
    return element
}

/**
 * element exists
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time in ms. If no element appear within this period, an error will be thrown
 * @param {HealingSnapshot} healingSnapshot healing snapshot file
 * @returns {ElementHandle}
 */
exports.waitElementExists = async function (frame, elementSelector, timeout, healingSnapshot) {
    return thisWaitElementExists(frame, elementSelector, timeout, healingSnapshot)
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
    //clear current input field
    await element.evaluate(el => el.value = '');

    await element.type(text, { delay: 100 })

    //ensure the value has been changed correctly
    let currentValue = await element.evaluate(el => el.value);

    //if current value cannot be changed via typing text, set value directly
    let startTime = Date.now()
    while (currentValue != text) {
        await element.evaluate(el => el.blur());
        await element.evaluate((el, text) => el.value = text, text);
        await element.evaluate(node => node.dispatchEvent(new Event('change', { bubbles: true })));
        //wait for 500ms and confirm if change went through
        await new Promise(resolve => setTimeout(resolve, 500))
        currentValue = await element.evaluate(el => el.value);
        if (Date.now() - startTime > 10000) {
            assert.fail(`Unable to change "${elementSelector.displayName}" to value "${text}" in 10s`)
        }
    }

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
    while ((Date.now() - startTime) < timeout) {
        let element = await findElement(frame, elementSelector, timeout)
        let rect = await element.boundingBox()
        if (rect.width > 0 && rect.height > 0) {
            itemVisible = true
            break
        }
    }

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
 * @param {number} x percentage of coorindation x within element. Use '0.5' if you want to click on center
 * @param {number} y percentage of coorindation y within element. Use '0.5' if you want to click on center
 */
exports.click = async function (frame, elementSelector, x, y) {
    /** There is a problems with the coordinates when element that you try to click on it's no visible
     *  For some reason that I don't know the definition of the elemnt whent it's not visible on screen it's differetn with 
     * the same element that it's visible on sceen. When this function do the scroll to display the element (this
     * is made in the element.hover() method) the definition of the elemnt change and Bluestone cannot click on the
     * element.
     * The proposal it's add 2 lines of code, 
     * 1st Define the element
     * 2nd Scroll to see the element
     * 3rd Define the element (now that we are sure that the element it's visible and we can click on it)
     * continue with the workflow
     * 
     * _scrollIntoViewIfNeeded() method do the scroll to find the elemnt, the problem it's that it's a hidden function
     * so it could change in any moment. 
     * hover() method has an _scrollIntoViewIfNeeded() inside.
     */
    let element = await findElement(frame, elementSelector, 2000)
    // await element._scrollIntoViewIfNeeded() 
    await element.hover()
    element = await findElement(frame, elementSelector, 1000)
    //handle default value
    if (x < 0 || x == undefined || x > 1) x = null
    if (y < 0 || y == undefined || y > 1) y = null


    try {
        await element.hover()
        //if x and y offset is bigger than element itself, we will click on midle point
        //otherwise, it will go beyond the scope
        let elementPos = await element.boundingBox()

        if (x == null) {
            x = 0.5
        }
        if (y == null) {
            y = 0.5
        }
        let offsetX = elementPos.width * x
        let offsetY = elementPos.height * y
        try {
            try {
                await frame.mouse.click(elementPos.x + offsetX, elementPos.y + offsetY)
            } catch (error) {
                await element.click({ offset: { x: offsetX, y: offsetY } })
            }
        } catch (error) {
            await element.evaluate(node => {
                node.dispatchEvent(new Event('click'))
            })
        }
    } catch (error) {
        assert.fail(`Unable to click "${elementSelector.displayName}"`)
    }

    return `Click success!`
}

/**
 * Mouse down on UI element
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} x percentage coorindation x within element. Use '0.5' if you want to click on center
 * @param {number} y percentage coorindation y within element. Use '0.5' if you want to click on center
 */
exports.mouseDown = async function (frame, elementSelector, x, y) {
    let element = await findElement(frame, elementSelector, 2000)
    //handle default value
    if (x < 0 || x == undefined || x > 1) x = 0.5
    if (y < 0 || y == undefined || y > 1) y = 0.5


    try {
        //if x and y offset is bigger than element itself, we will click on midle point
        //otherwise, it will go beyond the scope
        let elementPos = await element.boundingBox()
        let absoluteX = elementPos.width * x + elementPos.x
        let absoluteY = elementPos.height * y + elementPos.y
        try {
            await element.hover()
            await frame.mouse.move(absoluteX, absoluteY)
            await frame.mouse.down(absoluteX, absoluteY)
        } catch (error) {
            await element.evaluate(node => {
                node.dispatchEvent(new Event('mousedown'))
            })
        }
    } catch (error) {
        assert.fail(`Unable to do mouse down on "${elementSelector.displayName}"`)
    }

    return `Click success!`
}
/**
 * Mouse Up on UI element
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} x percentage coorindation x within element. Use '0.5' if you want to click on center
 * @param {number} y percentage coorindation y within element. Use '0.5' if you want to click on center
 */
exports.mouseUp = async function (frame, elementSelector, x, y) {
    let element = await findElement(frame, elementSelector, 2000)
    //handle default value
    //handle default value
    if (x < 0 || x == undefined || x > 1) x = 0.5
    if (y < 0 || y == undefined || y > 1) y = 0.5



    try {
        //if x and y offset is bigger than element itself, we will click on midle point
        //otherwise, it will go beyond the scope
        let elementPos = await element.boundingBox()
        let absoluteX = elementPos.width * x + elementPos.x
        let absoluteY = elementPos.height * y + elementPos.y
        try {
            await frame.mouse.move(absoluteX, absoluteY, { steps: 3 })
            await frame.mouse.up(absoluteX, absoluteY)
        } catch (error) {
            await element.evaluate(node => {
                node.dispatchEvent(new Event('up'))
            })
        }
    } catch (error) {
        assert.fail(`Unable to do mouse down on "${elementSelector.displayName}"`)
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
 * @param {Browser} browser
 * @returns 
 */
exports.goto = async function (page, url, browser) {
    let iRetryCount = 0
    //override existing url with env vaiable
    url = getCurrentUrl(url)

    let individualUrlList = url.split(',')

    for (let i = 0; i < individualUrlList.length; i++) {
        let link = individualUrlList[i]
        if (browser != null) {
            let pageList = await browser.pages()
            if (pageList.length < i + 2) {
                page = await browser.newPage();
            }
            else {
                page = pageList[i + 1]
            }

            await page.bringToFront()
        }
        for (iRetryCount = 0; iRetryCount < 5; iRetryCount++) {
            try {

                await page.goto(link)
                break
            } catch (error) {
                console.log('Unable to go to ' + link)
                await new Promise(resolve => setTimeout(resolve, 500))
            }
        }
        if (iRetryCount == 5) {
            assert.fail('Unable to go to ' + link)
        }
    }
    return `Goto ${url} success!`

}

/**
 * Go to specific iframe component
 * @param {Page} page
*  @param {Frame} frame 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} timeout wait time(ms) for the frame. Please make it greater than 1000
 */
exports.gotoFrame = async function (page, frame, elementSelector, timeout) {
    //if current page locator is iframe, we will just go back to the top page
    if (elementSelector.locator == ConstantVar.parentIFrameLocator) {
        return page
    }
    let element = await findElement(page, elementSelector, timeout)
    try {
        frame = await element.contentFrame()
        return frame
    } catch (error) {
        return Promise.reject(`Unable to go to frame ${elementSelector.displayName}`)
    }
}
/**
 * Wait for timeout
 * @param {Page} page
 * @param {number} number wait time in ms
 */
exports.waitForTimeout = async function (page, number) {
    await page.waitForTimeout(number)
    return `wait for ${number}ms`
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
 * @param {VarSaver} vars
 */
exports.uploadByInput = async function upload(frame, vars, elementSelector, uploadPathes) {
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
    let mappedPath = []
    for (let i = 0; i < pathList.length; i++) {
        let fullPath = pathList[i]
        //in case it is a relative path, full path will be constructed
        if (!path.isAbsolute(fullPath)) {
            let currentFileDir = path.dirname(vars.currentFilePath)
            fullPath = path.join(currentFileDir, fullPath)
        }

        mappedPath.push(path.relative(process.cwd(), fullPath))
    }

    try {

        await inputElement.uploadFile(...mappedPath)
        await inputElement.evaluate(upload => upload.dispatchEvent(new Event('change', { bubbles: true })));
    } catch (error) {
        return Promise.reject(`Unable to Upload ${elementSelector.displayName}. Message:"${error.message}"`)
    }

    return `Upload Success!`
}

/**
 * Basic Authentication
 * @param {Page} page 
 * @param {string} username usernmae
 * @param {string} password password
 */
exports.basicAuthenticate = async function authenticate(page, username, password) {
    await page.authenticate({ username, password })
    return 'authenticate'
}

/**
 * Start to Drag
 * @param {Frame} frame 
 * @param {ElementSelector} selector
 */
exports.dragstart = async function dragstart(frame, selector) {
    try {
        let element = await findElement(frame, selector, 2000)
        await element.hover()
        await element.evaluate(node => {
            //declare global data transfer element
            bluestoneDataTransfer = new DataTransfer()
            let rect = node.getBoundingClientRect()
            const dragStartEvent = {
                bubbles: true,
                cancelable: true,
                screenX: rect.x,
                screenY: rect.y,
                clientX: rect.x,
                clientY: rect.y,
                dataTransfer: bluestoneDataTransfer
            };
            node.dispatchEvent(new DragEvent('dragstart', dragStartEvent))
        })
        await element.hover()

    } catch (error) {

    }

    return true
}

/**
 * Drop to Element
 * @param {Frame} frame 
 * @param {ElementSelector} selector
 */
exports.drop = async function dragstart(frame, selector) {
    try {
        let element = await findElement(frame, selector, 2000)
        await element.evaluate(node => {
            //retrieve global data transfer object
            bluestoneDataTransfer = bluestoneDataTransfer
            let rect = node.getBoundingClientRect()
            const dropEvent = {
                bubbles: true,
                cancelable: true,
                screenX: rect.x,
                screenY: rect.y,
                clientX: rect.x,
                clientY: rect.y,
                dataTransfer: bluestoneDataTransfer
            };
            node.dispatchEvent(new DragEvent('drop', dropEvent))
        })

    } catch (error) {

    }

    return true
}

/**
 * Initialize Bluestone Autoamtion
*  @param {VarSaver} vars 
 * @param {Page} page
 */
exports.initialize = async function (vars, page) {
    //watch download folder
    await initailizeDownload(vars, page)
    //inject page capture script
    await initializePageCapture(page)
    initializeFolder(vars.dataOutDir, vars.retryCount)
    initailizeAlertHandle(vars, page)
    //initialize testcase loader and save tc ast info
    vars.exportVarContextToEnv()

    return true
}

/**
 * Wait for download to complete
*  @param {VarSaver} vars 
 * @param {number} timeout Wait time till download to complete
 */
exports.waitForDownloadComplete = async function (vars, timeout) {
    //increase timeout if we are in retry mode
    if (vars.retryCount > 0) timeout = timeout * 1.5
    await vars.downloadManager.waitDownloadComplete(timeout)
    return true
}

/**
 * Handle alert 
 * @param {VarSaver} vars 
 * @param {number} timeout Wait time till download to complete
 */
exports.waitAndHandleAlert = async function (vars, timeout) {
    //increase timeout if we are in retry mode
    if (vars.retryCount > 0) timeout = timeout * 1.5
    await vars.alertManager.waitAlertComplete(timeout)
    return true
}
/**
 * Scroll the element to the specific coordinnate
 * @param {Frame} frame 
 * @param {ElementSelector} elementSelector 
 * @param {number} x x-coordinnate you want to scroll to
 * @param {number} y y-coordinnate you want to scroll to
 * @returns 
 */
exports.scroll = async function (frame, elementSelector, x, y) {
    let element = await findElement(frame, elementSelector, 2000)
    await element.evaluate((node, x, y) => { node.scroll(x, y) }, x, y)
    return true
}
/**
* Verify Style attribute value
* @param {Frame} frame The puppeteer frame object. 
* @param {ElementSelector} element element this function will interact with. We can only have 1 element as input
* @param {string} parameter Atributte to verify, backgroundColor, alignItems
* @param {string} expectedValue Expected Value, rgb(3, 102, 216), normal
* @param {HealingSnapshot} healingSnapshot healing snapshot file
* @returns {string}
*/
exports.getStyleAttribute = async function (frame, element, parameter, expectedValue, healingSnapshot) {


    //let elementSelected = await findElement(frame, element, 6000)
    let elementSelected = await thisWaitElementExists(frame, element, 6000, healingSnapshot)


    let result = await elementSelected.evaluate((node, parameter) =>
        window.getComputedStyle(node)[parameter]
        , parameter)
    assert.deepStrictEqual(result, expectedValue, `Error during Get Style Attribute, In element ¨${element.displayName}¨ baseline ¨${expectedValue}¨ current value: [${result}] for parameter ¨${parameter}¨`)

    return result
}

/**
 * Switch to tab by index
 * @param {Browser} browser 
 * @param {number} tabIndex tab index
 * @returns 
 */
exports.switchTab = async function (browser, tabIndex) {
    let pageList = await browser.pages()
    if (pageList.length <= tabIndex) {
        assert.fail(`Incorrect tabIndex. Total tab count: ${pageList.length}, desired tabIndex: ${tabIndex}`)
    }
    let page = pageList[tabIndex]
    await page.bringToFront()
    return { page, frame: page }
}


exports.scrollElementToMidview = class extends BluestoneType.BluestoneFunc {
    constructor() {
        super()
        this.locators = [{ locator: ['invalid_locator'] }]
    }
    /**
     * Scroll element to the middle of the screen
     * @param {Frame} frame frame. 
     * @param {ElementSelector} element element
     */
    async func(frame, element) {
        try {
            let elementSelected = await thisWaitElementExists(frame, element, 6000)
            elementSelected.evaluate(item => {
                item.scrollIntoView({ block: 'center', inline: 'center' })
            })
        } catch (error) {
            return Promise.reject(`Unable to scroll element into view:${element.displayName}    Error: ${error}`)
        }

        return true
    }

}
