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
const { Page, Browser } = require('puppeteer-core')
const openBluestoneTab = require('../activities/openBluestoneTab')
const checkLocatorInDefiner = require('../activities/checkLocatorInDefiner')
class PuppeteerControl {
    constructor() {
        /** @type {Page}*/
        this.page = null
        /** @type {Browser}*/
        this.browser = null
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
}

module.exports = PuppeteerControl