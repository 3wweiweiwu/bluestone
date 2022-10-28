const { Browser, Page, ElementHandle, Frame } = require('puppeteer-core')
const { ElementSelector } = require('../class/index')
const findElement = require('./findElement');
const bluestoneType = require('../class/index');
const assert = require('assert');


exports.funcClass = class extends bluestoneType.BluestoneFunc {
    constructor() {
        super()
        /**
         * This is the place where you tell bluestone when to show your customized function
         * If you keep default value, your function will be showed up all the time
         * This is a bad practice because user will get confused with all the functions you have
         * You want to make your function only show up when relavent locator appears. 
         * Example: 
         * this.locators = [bluestoneLocator['Locator 1'],bluestoneLocator['Locator 2']]
         */
        this.locators = []
    }
    /**
     * Wait until the element is unblocked by others
     * @param {Frame} frame 
     * @param {ElementSelector} elementSelector element selector object
     * @param {number} timeout wait time in ms
     * @returns 
     */
    async func(frame, elementSelector, timeout) {

        let element = await findElement(frame, elementSelector, 1000, { isHealingByLocatorBackup: false, takeSnapshot: false, throwError: true }, [])
        try {


            var time = new Date().getTime();
            const final = time + timeout
            while (time < final) {
                let isBlocked = await isElementBlocked(element)
                if (!isBlocked) {
                    return true
                }
                time = new Date().getTime();
            }

        } catch (error) {
            console.log(error)
        }

        assert.fail(`Element: ${elementSelector.displayName} is blocked for more than ${timeout} ms`)
    }



}

/**
 * Check if element is covered by anything
 * @param {ElementHandle} element 
 */
async function isElementBlocked(element) {
    try {
        let result = await element.evaluate(element => {
            function isVisible(elem) {
                if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
                const style = getComputedStyle(elem);
                if (style.display === 'none')
                    return false;
                if (style.visibility !== 'visible')
                    return false;
                if (style.opacity < 0.1)
                    return false;
                if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
                    elem.getBoundingClientRect().width === 0) {
                    return false;
                }
                let elemBoundingRect = elem.getBoundingClientRect()
                if (elemBoundingRect.width == 0)
                    return false
                if (elemBoundingRect.height == 0)
                    return false
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

                if (elemCenter.x < 0)
                    return false;
                if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth))
                    return false;
                if (elemCenter.y < 0)
                    return false;
                if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight))
                    return false;
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
                    if (item == sourceElement)
                        return false
                    if (!isVisible(item))
                        return false
                    let itemRect = item.getBoundingClientRect()

                    if (!isSourceCoveredByTarget(sourceRect, itemRect))
                        return false
                    let itemZIndex = getZIndex(item)
                    return itemZIndex > sourceZIndex

                })
                return coveredElement

            }
            return isSourceCoveredByAnyElement(element) != null
        }, element)

        return result
    } catch (error) {
        console.log(error)
        return false
    }

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