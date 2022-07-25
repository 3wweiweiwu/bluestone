/**
 * @typedef ElementPos
 * @property {number} x
 * @property {number} y
 * @property {number} right
 * @property {number} buttom
 * @property {number} height
 * @property {number} width
 */

/**
 * @typedef EventDetail
 * @property {string} event //name of the event. examples['click', 'change', 'dblclick', 'keydown', 'submit','goto']
 * @property {string} selector //path to the selector
 * @property {ElementPos} pos
*/
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
const { Page, Browser } = require('puppeteer-core')
const openBluestoneTab = require('../activities/openBluestoneTab')
const getFrame = require('../activities/getFrame')
const getLocator = require('../activities/getLocator')
const path = require('path')
const fs = require('fs')
const getRecommendedLocator = require('../activities/getRecommendedLocator')
const PuppeteerResult = require('../../mocha/class/StepResult')
const _eval = require('eval')
const ptInbuiltFunc = require('../../../ptLibrary/functions/inbuiltFunc')
const takeScreenshotForLocatorDefiner = require('../activities/takeScreenshotForLocatorDefiner')
const StepAbortManager = require('../help/StepAbortManager')
class PuppeteerControl {
    constructor() {
        /** @type {Page}*/
        this.page = null
        /** @type {Browser}*/
        this.browser = null
        this.io = null
        this.__isExecutionOngoing = false //execution status has 3 status. true-> ongoing false-> completed null=>aborted
        this.StepAbortManager = StepAbortManager
    }
    get isExecutionOngoing() {
        return this.__isExecutionOngoing
    }
    set isExecutionOngoing(status) {
        this.__isExecutionOngoing = status
    }
    static inbuiltEvent = {
        refresh: 'refresh',
        scanLocator: 'scan-locator',
        markSelectorIndex: 'mark-selector-index'
    }
    setPage(page) {
        this.page = page
    }
    setBrowser(browser) {
        this.browser = browser
    }
    setIO(io) {
        this.io = io
    }
    /**
     * launch bluestone page and go to specified bluestone path     
     * @param {'spy'|'workflow'} bluestonePath 
     */
    async openBluestoneTab(bluestonePath) {
        let result = await openBluestoneTab(this.browser, bluestonePath)
        return result
    }
    /**
     * Provide list of locator for target element
     * @param {string} targetLocator 
     * @param {Array<string>} parentFrame 
     */
    async getRecommendedLocator(targetLocator, parentFrame) {
        let result = await getRecommendedLocator(this.browser, this.page, targetLocator, parentFrame)
        return result
    }
    refreshSpy() {
        if (this.io) {
            this.io.emit(PuppeteerControl.inbuiltEvent.refresh)
        }
    }
    scanLocatorInBrowser() {
        if (this.io) {
            this.io.emit(PuppeteerControl.inbuiltEvent.scanLocator)
        }
    }
    setSelectorIndexForLocator(locator, index) {
        if (this.io) {
            this.io.emit(PuppeteerControl.inbuiltEvent.markSelectorIndex, {
                locator, index
            })
        }
    }
    /**
     * 
     * @param {string} targetLocator the locator for target element
     * @param {string} currentLocator current locator user provided
     * @param {string} parentIframes the parent frame of current element
     * @param {boolean} isRequiredLocatorUpdate are we in locator update mode?
     * @returns 
     */
    async checkLocatorBasedOnDefiner(targetLocator, currentLocator, parentIframes, isRequiredLocatorUpdate) {
        //sidebar is the id for the locatorDefinerpug
        let page = this.page
        await this.page.bringToFront()

        /** @type {Array<ElementHandle>} */
        let elements = []
        let errorText = ''

        //when isRequiredLocatorUpdate is true, it means we runs the script in the runner and it didn't work
        //if that is the case, we will just trust whatever things that comes from the user
        //in this case, we make target equal to current locator
        if (isRequiredLocatorUpdate) {
            targetLocator = currentLocator
        }
        //if target locator is equal to current locator and equals to null, it means we are dealing with parent locator, just return as it is

        //navigate through frames and get to current elements
        let frame = await getFrame(this.page, parentIframes)
        if (frame == null) {
            return `Unable to navigate to iframe ${JSON.stringify(parentIframes)}`
        }

        if (parentIframes.length == 0 && targetLocator == ptInbuiltFunc.VAR.parentIFrameLocator) {
            //we are swithcing back to the top frame
            if (currentLocator == ptInbuiltFunc.VAR.parentIFrameLocator) {
                return errorText
            }
            else {
                return 'Please use default value as we are switching back to parent frame'
            }
        }
        //check if we are at the right html page
        /** @type {Array<ElementHandle>} */
        let targetElementList = await getLocator(frame, targetLocator, 10000)
        if (targetElementList.length == 0) {
            errorText = 'Original Selector cannot be found in current html snapshot. Please click <Previous Html> button and find right snapshot'
            return errorText
        }
        else if (targetElementList.length > 1) {
            errorText = 'Incorrect Original Selector. The current html page is incorrect. Please contact bluestone team or check your selector generator'
            return errorText
        }
        //get target element
        let targetElement = targetElementList[0]
        //put rectangle around element to make it easy to identify
        targetElement.evaluate(node => {
            //record previous border info
            node.setAttribute('bluestone-previous-border', node.style.border)
            //draw rectangle
            node.style.border = "thick solid #0000FF"
        })
        await takeScreenshotForLocatorDefiner(this.page)
        targetElement.evaluate(node => {
            //remove rectangle
            let prevBorder = node.getAttribute('bluestone-previous-border')
            node.removeAttribute('bluestone-previous-border')
            node.style.border = prevBorder
        })
        //check current locator user specified
        elements = await getLocator(frame, currentLocator, 10000)

        if (elements.length == 0) {
            errorText = 'Cannot find locator specified. Please try different locator'
        }
        else if (elements.length > 1) {
            errorText = 'More than 1 locator is found. Please try something else'
        }
        else {
            //check if two elements are of the same coordination


            let targettBox = await targetElement.boundingBox()
            let currentBox = await elements[0].boundingBox()
            if (currentBox == null) {
                //when targebox and current box is invisible, conduct blind check
                if (targettBox != currentBox) {
                    errorText = 'The current element is not found'
                }
            }
            else if (targettBox == null) {
                //target element cannot be found. Conduct blind check
                return errorText
            }
            else if (targettBox.height + targettBox.y < currentBox.height + currentBox.y ||
                //check if current element is within the target element.
                targettBox.width + targettBox.x < currentBox.width + currentBox.x ||
                targettBox.x > currentBox.x ||
                targettBox.y > currentBox.y
            ) {
                errorText = 'The current element is not contained within target element'
            }

            //check if current element and target element has same inner text. This is important becasue we might use current value for text validation
            let targetText = await targetElement.evaluate(el => el.textContent);
            let currentText = await elements[0].evaluate(el => el.textContent);
            if (errorText == '' && targetText != currentText) {
                errorText = `Inner Text is different. The target locator has inner text "${targetText}" while the current locator has inner text "${currentText}"`
            }
        }
        return errorText



    }
    /**
     * Run current step
     * @param {import('../../ast/class/Function')} functionAst
     * @param {ElementSelector} elementSelector
     * @param {Array<string>} parentFrame
     */
    async runCurrentStep(functionAst, elementSelector, parentFrame) {

        let isResultPass = true
        let resultNote = ''


        try {

            await this.page.bringToFront()
            let frame = await getFrame(this.page, parentFrame)


            let argumentNContext = functionAst.generateArgumentNContext(this.browser, this.page, elementSelector, frame)
            let argumentStr = argumentNContext.argumentStr
            let currentScope = argumentNContext.currentScope
            currentScope['mainFunc'] = functionAst.mainFunc
            currentScope['StepAbortManager'] = this.StepAbortManager
            let res = null
            this.isExecutionOngoing = true
            res = _eval(`
            Promise.race([mainFunc(${argumentStr}),StepAbortManager.monitorStepAbortion()])
                            .then(result => {
                                exports.res = result

                            })
                            .catch(err => {
                                console.log(err)
                                exports.err = err
                            })
                            `, 'runPtFunc.js', currentScope, false)
            //wait till execution is completed
            while (true) {
                await this.page.waitForTimeout(1000)
                if (res.res != null) {
                    isResultPass = true
                    resultNote = res.res
                    break
                }
                if (res.err != null) {
                    isResultPass = false
                    resultNote = res.err
                    break
                }
                if (this.isExecutionOngoing == null) {
                    isResultPass = false
                    resultNote = 'Operation is Aborted by User'
                    break
                }
            }
        } catch (error) {
            isResultPass = false
            resultNote = `Error during runPtFunc.js: ${error.toString()}`
        }
        //execution has completed 
        this.isExecutionOngoing = false
        let pResult = new PuppeteerResult()
        pResult.isResultPass = isResultPass
        pResult.resultText = resultNote
        return pResult
    }
    /**
     * Clean up all cookie and browser cache on current page
     */
    async cleanCache() {
        const client = await this.page.target().createCDPSession();
        await client.send('Network.clearBrowserCookies');
        await client.send('Network.clearBrowserCache');
    }
}

module.exports = PuppeteerControl