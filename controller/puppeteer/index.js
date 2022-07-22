const puppeteer = require('puppeteer')
const config = require('../../config')
const logEvent = require('./exposure/logEvent')
const isRecording = require('./exposure/isRecordng')
const logCurrentElement = require('./exposure/logCurrentElement')
const isSpyVisible = require('./exposure/isSpyVisible')
const setSpyVisible = require('./exposure/setSpyVisible')
const ElementSelector = require('../../ptLibrary/class/ElementSelector')
const captureHtml = require('./exposure/captureHtml')
const { saveUploadedFile, getUploadFilePath } = require('./exposure/saveUploadedFile')
const path = require('path')
const fs = require('fs').promises
const { RecordingStep, WorkflowRecord } = require('../record/class')
const { getLocator, setLocatorStatus } = require('./exposure/LocatorManager')
const injectModuleScriptBlock = require('./help/injectModuleScriptBlock')
const captureScreenshot = require('./exposure/captureScreenshot')
const checkUrlBlackList = require('./help/checkUrlBlacklist')
const isHtmlCaptureOngoing = require('./exposure/isHtmlCaptureOngoing')
const DownloadWatcher = require('./class/DownloadWatcher')
const AlertWatcher = require('./class/AlertWatcher')
/**
 * Create a new puppeteer browser instance
 * @param {import('../record/class/index').WorkflowRecord} record
 * @param {import('socket.io').Server} io
 */

const ConstStr = {
    'bluestone-locator': 'bluestone-locator', //This is attribute we used to store locator mapping info
}
/**
 * 
 * @param {import('../record/class').WorkflowRecord} record 
 * @param {*} io 
 * @param {string} url
 * @param {boolean} isCleanSteps clean prior steps. will not clean step if we are in testcase edit mode
 * @returns 
 */
async function startRecording(record, io, url = null, isCleanSteps = true) {
    const browser = await puppeteer.launch(config.puppeteer)
    const page = await browser.newPage();
    //start to watch the download event
    const download = new DownloadWatcher((record))
    await download.startWatching()

    //initialize alert watcher
    const alert = new AlertWatcher(record, page, logEvent)
    await alert.startWatching()

    //initialize recording object
    if (isCleanSteps) {
        record.steps = []
        record.isRecording = true
        record.isCaptureHtml = true
    }
    else {
        //will not record steps by default
        record.isRecording = false
        record.isCaptureHtml = false
    }


    //update io for record
    record.puppeteer.setIO(io)
    record.puppeteer.setBrowser(browser)
    record.puppeteer.setPage(page)
    //inject event watcher and expose supporting function
    let eventRecorderPath = path.join(__dirname, './injection/eventRecorder.js')
    await injectModuleScriptBlock(page, eventRecorderPath)

    //inject singlepage
    // const injectedScript = await singlefileScript.get(config.puppeteer);
    // await page.evaluateOnNewDocument(injectedScript)

    //inject robust Locator Generator
    let robustLocatorPath = path.join(__dirname, '../../public/javascript/robustLocatorGen.js')
    let robustLocatorGenScript = await fs.readFile(robustLocatorPath)
    await page.evaluateOnNewDocument(robustLocatorGenScript.toString())

    //inject getEventListener
    // const eventListener = await fs.readFile(path.join(__dirname, '../../public/javascript/getEventListner.js'))
    // await page.evaluateOnNewDocument(eventListener)

    await page.exposeFunction('logEvent', logEvent(record, browser, page, io))
    await page.exposeFunction('isRecording', isRecording(record))
    await page.exposeFunction('logCurrentElement', logCurrentElement(record, page))
    await page.exposeFunction('getLocator', getLocator(record))
    await page.exposeFunction('setLocatorStatus', setLocatorStatus(record))
    await page.exposeFunction('isSpyVisible', isSpyVisible(record))
    await page.exposeFunction('setSpyVisible', setSpyVisible(record))
    await page.exposeFunction('captureHtml', captureHtml(page, record))
    await page.exposeFunction('captureScreenshot', captureScreenshot(page, record))
    await page.exposeFunction('saveUploadedFile', saveUploadedFile(record))
    await page.exposeFunction('getUploadFilePath', getUploadFilePath)
    await page.exposeFunction('isHtmlCaptureOngoing', isHtmlCaptureOngoing(record))

    await page.setBypassCSP(true)
    await page.client().send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: download.downloadFolder });


    if (url != null) {
        for (let i = 0; i < 5; i++) {
            try {
                await page.goto(url)
                break
            } catch (error) {
                console.log('Unable to go to ' + url)
            }
        }
    }
    let eventStep = new RecordingStep({ command: 'goto', target: url, iframe: '[]' })
    eventStep.parameter = url
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
    if (browser != null) {
        await browser.close()
    }

}

/**
 * switch in-browser spy
 * @param {import('puppeteer').Page} page 
 */
async function hideSpy(puppeteerControl, isSpyVisible) {
    if (isSpyVisible == true) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready
    let page = puppeteerControl.page
    await page.bringToFront()
    page.evaluate(() => {
        // window.captureHtml()
        captureScreenshot()
    })
    puppeteerControl.scanLocatorInBrowser()

}

module.exports = { startRecording, endRecording, hideSpy, }