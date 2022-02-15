const ElementSelector = require('../class/ElementSelector')
const { captureHtml } = require('./snapshotCapture')
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
    await captureHtml(page)

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
            let clientHeight = await element.evaluate(node => node.getBoundingClientRect().height)
            let isBlocked = await isElementBlocked(element)
            if (clientHeight != 0 && !isBlocked) {
                break
            }
        }
    } while (timeSpan < timeout);

    if (element == null) {
        await captureHtml(page)
        let info = `Unable to find UI element: "${elementSelector.displayName}" in ${timeout}ms`
        if (option.throwError) {
            return Promise.reject(info)
        }
        else {
            console.log(info)
        }

    }

    return element

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