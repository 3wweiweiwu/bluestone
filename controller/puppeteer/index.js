const puppeteer = require('puppeteer-core')
const config = require('../../config')
const logEvent = require('./exposure/logEvent')
const isRecording = require('./exposure/isRecordng')
const logCurrentElement = require('./exposure/logCurrentElement')
const isSpyVisible = require('./exposure/isSpyVisible')
const setSpyVisible = require('./exposure/setSpyVisible')
const runPtFunc = require('./exposure/runPtFunc')
const path = require('path')
const fs = require('fs').promises
const { RecordingStep, WorkflowRecord } = require('../record/class')
const { getLocator, setLocatorStatus } = require('./exposure/LocatorManager')
const injectModuleScriptBlock = require('./help/injectModuleScriptBlock')
const singlefileScript = require('single-file/cli/back-ends/common/scripts')
/**
 * Create a new puppeteer browser instance
 * @param {import('../record/class/index').WorkflowRecord} record
 * @param {import('socket.io').Server} io
 */

const ConstStr = {
    'bluestone-locator': 'bluestone-locator', //This is attribute we used to store locator mapping info
}

async function startRecording(record, io, url = null) {
    const browser = await puppeteer.launch(config.puppeteer)
    const page = await browser.newPage();

    //inject event watcher and expose supporting function
    let eventRecorderPath = path.join(__dirname, './injection/eventRecorder.js')
    await injectModuleScriptBlock(page, eventRecorderPath)

    //inject singlepage
    const injectedScript = await singlefileScript.get(config.puppeteer);
    await page.evaluateOnNewDocument(injectedScript)



    await page.exposeFunction('logEvent', logEvent(record, browser, page, io))
    await page.exposeFunction('isRecording', isRecording(record))
    await page.exposeFunction('logCurrentElement', logCurrentElement(record))
    await page.exposeFunction('getLocator', getLocator(record))
    await page.exposeFunction('setLocatorStatus', setLocatorStatus(record))
    await page.exposeFunction('isSpyVisible', isSpyVisible(record))
    await page.exposeFunction('setSpyVisible', setSpyVisible(record))
    await page.exposeFunction('runPtFunc', runPtFunc(record, browser, page, io))



    await page.setBypassCSP(true)


    if (url != null) await page.goto(url)
    let eventStep = new RecordingStep({ command: 'goto', target: url })
    eventStep.finalLocator = 'FAKE locator to avoid check'
    eventStep.finalLocatorName = 'FAKE locator name to avoid check'
    logEvent(record)(eventStep)
    return { browser, page }
}
/**
 * Close the puppeteer browser
 * @param {import('puppeteer').Browser} browser 
 */
async function endRecording(browser) {
    await browser.close()
}

/**
 * switch in-browser spy
 * @param {import('puppeteer').Page} page 
 */
async function hideSpy(page, isSpyVisible) {
    if (isSpyVisible == true) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready

    await page.bringToFront()


}
/**
 * run current opeation if runCurrentOperation argument is true
 * @param {import('puppeteer').Page} page 
 */
async function runCurrentOperation(page, runOperation) {
    if (runOperation == false) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready

    await page.evaluate(() => {
        window.runPtFunc()
    })



}
module.exports = { startRecording, endRecording, hideSpy, runCurrentOperation }