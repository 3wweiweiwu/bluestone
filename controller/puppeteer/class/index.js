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
const checkLocatorInDefiner = require('../activities/checkLocatorInDefiner')
const getRecommendedLocator = require('../activities/getRecommendedLocator')
const PuppeteerResult = require('../../mocha/class/StepResult')
const _eval = require('eval')
class PuppeteerControl {
    constructor() {
        /** @type {Page}*/
        this.page = null
        /** @type {Browser}*/
        this.browser = null
        this.io = null
        this.__isExecutionOngoing = false //execution status has 3 status. true-> ongoing false-> completed null=>aborted
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
        let result = await getRecommendedLocator(this.browser, targetLocator, parentFrame)
        return result
    }
    /**
     * Check if current locator exists in definer
     * @param {string} targetLocator 
     * @param {string} currentLocator
     * @param {Array<string>} parentFrame 
     * @returns 
     */
    async checkLocatorInDefiner(targetLocator, currentLocator, parentFrame) {
        let result = await checkLocatorInDefiner(this.browser, targetLocator, currentLocator, parentFrame)
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
            let res = null
            this.isExecutionOngoing = true
            res = _eval(`
            mainFunc(${argumentStr})
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