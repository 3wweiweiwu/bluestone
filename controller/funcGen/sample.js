const { Browser, Page, ElementHandle, Frame } = require('puppeteer-core')
const { ElementSelector, VarSaver } = require('bluestone').types
const bluestoneFunc = require('bluestone/ptLibrary/bluestone-func');
const bluestoneType = require('bluestone/ptLibrary/class/index');
const assert = require('assert')

/**
 * This is a sample customized function. Feel free to add/modify/delete elements
 * @param {Browser} browser The puppeteer browser class
 * @param {Page} page The puppeteer page class
 * @param {Frame} frame The puppeteer frame object. 
 * @param {ElementSelector} element element this function will interact with. We can only have 1 element as input
 * @param {VarSaver} vars The scope we will use
 * @param {string} stringArg1 The string input
 * * @param {number} numberArg The number input
 * @returns 
 */
exports.sampleFunctionName = async function (browser, page, frame, element, vars, stringArg1, numberArg) {
    assert.deepEqual(1, 2, 'Current function have not been implemented') //please remove this line after implmentation
    return true //please leave this line if you don't want to return value
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
