const ElementSelector = require('../class/ElementSelector')
const HealingSnapshot = require('../class/HealingSnapshot')
const { captureSnapshot } = require('./snapshotCapture')
const { Browser, Page, ElementHandle } = require('puppeteer-core')
const assert = require('assert')
class Options {
    constructor() {
        /** @type {boolean} if no element is found, should we throw error?*/
        this.throwError = false
        this.takeSnapshot = true
        this.isHealingByLocatorBackup = true
    }


}
const VarSaver = require('../class/VarSaver')

module.exports = waitForElement
/**
 * Find a element within timeout period. If no element is found, a error will be thrown
*  @param {Page} page 
 * @param {ElementSelector} elementSelector element selector object
 * @param {Options} option 
 * @param {number} timeout wait time in ms
 * @param {HealingSnapshot} healingSnapshot locator snapshot for auto-healing. File under .\snapshot\
 * @returns {ElementHandle}
 */
async function waitForElement(page, elementSelector, timeout, option = new Options(), healingSnapshot) {
    /**@type {Array<string>} */
    let locatorOptions = elementSelector.locator
    //find locator option within timeout
    let startTime = Date.now()
    /**@type {ElementHandle} */
    let element = null
    let elementInfo = null
    let timeSpan = 0
    let varSav = VarSaver.parseFromEnvVar()
    let pageData = null
    //extends the timeout by 1.5x if we are in the retry mode
    if (varSav.retryCount > 0) timeout = timeout * 1.5
    let blockedElement = null
    do {

        try {
            for (let i = 0; i < locatorOptions.length; i++) {
                let locator = locatorOptions[i]
                element = await getElementByLocator(page, locator)

                if (element != null) {
                    break
                }

            }
        } catch (error) {

        }
        let currentTime = Date.now()
        timeSpan = currentTime - startTime
        if (element != null) {
            let clientHeight = await element.evaluate(node => node.getBoundingClientRect().height)
            // let x = await element.evaluate(node => node.getBoundingClientRect().x)
            // let y = await element.evaluate(node => node.getBoundingClientRect().y)
            let isBlocked = await isElementBlocked(element)
            if (clientHeight != null && clientHeight != 0 && !isBlocked) {
                break
            }
        }
        blockedElement = element
        element = null
    } while (timeSpan < timeout);

    //locator found correctly and it is not part of healing trial, log coverage info
    if (element != null && option.isHealingByLocatorBackup) {
        try {
            await varSav.healingInfo.createPerscription(elementSelector.displayName, elementSelector.locator, elementSelector.locator, null, varSav.currentFilePath, true)
        } catch (error) {

        }

    }

    //conduct locator-based auto-healing
    if (option.isHealingByLocatorBackup && element == null) {
        elementInfo = await getElementBasedOnLocatorBackup(page, elementSelector, 0.8)
        element = elementInfo.element
        if (element != null) {
            pageData = await highlightProposedElement(page, element)
            await varSav.healingInfo.createPerscription(elementSelector.displayName, elementSelector.locator, elementInfo.locator, pageData, varSav.currentFilePath, false)
        }
    }
    if (option.takeSnapshot) {
        try {
            if (pageData == null && varSav.isTakeSnapshot == true) {
                try {
                    pageData = await highlightProposedElement(page, element)
                } catch (error) {
                    pageData = await page.screenshot({ type: 'png' })
                }

            }
            await captureSnapshot(pageData)
        } catch (error) {
        }
    }
    //in case element is blocked and we cannot find any good alternative, use blocked element
    //as a final workaround
    if (element == null && blockedElement != null) {
        element = blockedElement
    }
    if (element == null) {
        let info = `Unable to find UI element: "${elementSelector.displayName}" in ${timeout}ms`
        //only add result to locator report only when original locator is not found
        //otherwise, it will log the locator that is used as part of auto-healing process into the log
        //, we only want to see if original locator is working. We don't care failure during 
        //locator healing
        if (option.isHealingByLocatorBackup) {
            await varSav.healingInfo.addWorkingLocatorRecord(elementSelector.displayName, false)
        }

        if (option.throwError) {
            assert.fail(info)
        }
        else {
            console.log(info)
        }

    }

    return element

}
class ElementInfo {
    constructor(element, locator) {
        this.element = element
        this.locator = locator
        this.count = 0
    }
    addCount() {
        this.count += 1
    }
}
/**
 * Check if element is covered by anything
 * @param {ElementHandle} element 
 */
async function isElementBlocked(element) {
    let result = await element.evaluate(element => {
        function isVisible(elem) {
            if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
            const style = getComputedStyle(elem);
            if (style.display === 'none') return false;
            if (style.visibility !== 'visible') return false;
            if (style.opacity < 0.1) return false;
            if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
                elem.getBoundingClientRect().width === 0) {
                return false;
            }
            let elemBoundingRect = elem.getBoundingClientRect()
            if (elemBoundingRect.width == 0) return false
            if (elemBoundingRect.height == 0) return false
            let offsetWidth = elem.offsetWidth
            let offsetHeight = elem.offsetHeight
            if (elem.offsetWidth == null) {
                offsetWidth = elemBoundingRect.width
            }
            if (elem.offsetHeight == null) {
                offsetHeight = elemBoundingRect.height
            }
            const elemCenter = {
                x: elemBoundingRect.left + offsetWidth / 2,
                y: elemBoundingRect.top + offsetHeight / 2
            };

            if (elemCenter.x < 0) return false;
            if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
            if (elemCenter.y < 0) return false;
            if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
            let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
            do {
                if (pointContainer === elem) return true;
                try {
                    pointContainer = pointContainer.parentNode
                }
                catch (err) {
                    break
                }

            } while (pointContainer);
            return false;
        }

        function getZIndex(element) {

            let zIndex = 0

            while (true) {
                let zIndexStr = window.getComputedStyle(element).zIndex
                if (zIndexStr != 'auto') {
                    let currentZIndex = Number.parseInt(zIndexStr)
                    if (currentZIndex > zIndex)
                        zIndex = currentZIndex
                }

                element = element.parentElement
                if (element == null) break
            }

            return zIndex
        }
        function isSourceCoveredByTarget(sourceRect, targetRect) {
            let xCenter = (sourceRect.x + sourceRect.width / 2)
            let yCenter = (sourceRect.y + sourceRect.height / 2)

            let targetXMost = targetRect.x + targetRect.width
            let targetYMost = targetRect.y + targetRect.height

            return (xCenter > targetRect.x) && (xCenter < targetXMost) && (yCenter > targetRect.y) && (yCenter < targetYMost)
        }

        function isSourceCoveredByAnyElement(sourceElement) {
            let allElemenets = [...document.getElementsByTagName('*')]
            let sourceRect = sourceElement.getBoundingClientRect()
            let sourceZIndex = getZIndex(sourceElement)

            let coveredElement = allElemenets.find(item => {
                if (item == sourceElement) return false
                if (!isVisible(item)) return false
                let itemRect = item.getBoundingClientRect()

                if (!isSourceCoveredByTarget(sourceRect, itemRect)) return false
                let itemZIndex = getZIndex(item)
                return itemZIndex > sourceZIndex

            })
            return coveredElement

        }
        return isSourceCoveredByAnyElement(element) != null
    }, element)
    return result
}
/**
 * Based on locator, return element handle
 * @param {Page} page
 * @param {string} locator 
 * @returns {ElementHandle}
 */
async function getElementByLocator(page, locator) {
    let element = null
    if (locator.startsWith('/') || locator.startsWith('(')) {
        //xpath
        let elementResult = await page.$x(locator)
        if (elementResult.length > 0) element = elementResult[0]
    }
    else {
        //selector
        element = await page.$(locator)
    }
    return element
}
/**
 * Use backup locator to find out element whose similarity score is highest
*  @param {Page} page 
 * @param {ElementSelector} elementSelector element selector object
 * @param {number} similarityBenchmark
 * @returns {ElementInfo}
 */
async function getElementBasedOnLocatorBackup(page, elementSelector, similarityBenchmark) {
    /**@type {Object.<string,ElementInfo>} */
    let elementDict = {}
    let sum = 0
    /**@type {string} */
    let bestId = null
    let bestElement = new ElementInfo(null, '')
    if (elementSelector.snapshot == null) {
        return bestElement
    }
    //get existing elements
    for (const locator of elementSelector.snapshot) {
        let newElementSelector = new ElementSelector([locator], null, `Locator-based Auto-healing - ${elementSelector.displayName} - ${locator}`)
        let element = await waitForElement(page, newElementSelector, 1, { takeSnapshot: false, throwError: false, isHealingByLocatorBackup: false })
        if (element != null) {
            let id = await element.boundingBox()
            id = JSON.stringify(id)
            sum += 1
            if (elementDict[id] == null) {
                elementDict[id] = new ElementInfo(element, locator)
            }

            elementDict[id].addCount()



            //get best element
            if (bestId == null) {
                bestId = id
            }
            else {
                if (elementDict[bestId] < elementDict[id]) {
                    bestId = id
                }
            }
        }

    }
    //get score for possible locator
    if (bestId == null) {
        return { element: null }
    }
    let currentSimilarity = elementDict[bestId].count / sum
    if (currentSimilarity > similarityBenchmark) {
        bestElement = elementDict[bestId]
    }

    return bestElement
}
/**
 * 
 * @param {Page} page 
 * @param {ElementHandle} element 
 */
async function highlightProposedElement(page, element) {
    let borderStyle = await element.evaluate(node => {
        //record previous border info
        let borderStyle = node.style.border
        //draw rectangle
        node.style.border = "thick solid #0000FF"
        return borderStyle
    })
    let pageData = await page.screenshot({ type: 'png' })
    await element.evaluate((node, prevBorderStyle) => {
        node.style.border = prevBorderStyle
    }, borderStyle)
    return pageData

}