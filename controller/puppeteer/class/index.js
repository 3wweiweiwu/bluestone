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
const checkLocatorInDefiner = require('../activities/checkLocatorInDefiner')
const PuppeteerResult = require('../../record/class/StepResult')
const _eval = require('eval')
class PuppeteerControl {
    constructor() {
        /** @type {Page}*/
        this.page = null
        /** @type {Browser}*/
        this.browser = null
        this.io = null
    }
    static inbuiltEvent = {
        refresh: 'refresh'
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

    async checkLocatorInDefiner(targetLocator, currentLocator) {
        let result = await checkLocatorInDefiner(this.browser, targetLocator, currentLocator)
        return result
    }
    refreshSpy() {
        if (this.io) {
            this.io.emit(PuppeteerControl.inbuiltEvent.refresh)
        }
    }
    /**
     * Run current step
     * @param {import('../../ast/class/Function')} functionAst
     * @param {ElementSelector} elementSelector
     */
    async runCurrentStep(functionAst, elementSelector) {

        let isResultPass = true
        let resultNote = ''
        let argumentNContext = functionAst.generateArgumentNContext(this.browser, this.page, elementSelector)
        let argumentStr = argumentNContext.argumentStr
        let currentScope = argumentNContext.currentScope
        currentScope['mainFunc'] = functionAst.mainFunc
        let res = null

        await this.page.bringToFront()
        try {
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
            }
        } catch (error) {
            isResultPass = false
            resultNote = `Error during runPtFunc.js: ${error.toString()}`
        }
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