const puppeteer = require('puppeteer')
const config = require('../../config')
const logEvent = require('./exposure/logEvent')
const isRecording = require('./exposure/isRecordng')
const logCurrentElement = require('./exposure/logCurrentElement')
const isSpyVisible = require('./exposure/isSpyVisible')
const setSpyVisible = require('./exposure/setSpyVisible')
const ElementSelector = require('../../ptLibrary/class/ElementSelector')
const captureHtml = require('./exposure/captureHtml')
const saveUploadedFile = require('./exposure/saveUploadedFile')
const path = require('path')
const fs = require('fs').promises
const { RecordingStep, WorkflowRecord } = require('../record/class')
const { getLocator, setLocatorStatus } = require('./exposure/LocatorManager')
const injectModuleScriptBlock = require('./help/injectModuleScriptBlock')
const singlefileScript = require('single-file/cli/back-ends/common/scripts')
const captureScreenshot = require('./exposure/captureScreenshot')
const checkUrlBlackList = require('./help/checkUrlBlacklist')
const { drawPendingWorkProgress } = require('./activities/drawPendingWorkProgress')
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
 * @returns 
 */
async function startRecording(record, io, url = null) {
    const browser = await puppeteer.launch(config.puppeteer)
    const page = await browser.newPage();
    //initialize recording object
    record.steps = []
    record.isRecording = true

    //update io for record
    record.puppeteer.setIO(io)
    record.puppeteer.setBrowser(browser)
    record.puppeteer.setPage(page)
    //inject event watcher and expose supporting function
    let eventRecorderPath = path.join(__dirname, './injection/eventRecorder.js')
    await injectModuleScriptBlock(page, eventRecorderPath)

    //inject singlepage
    const injectedScript = await singlefileScript.get(config.puppeteer);
    await page.evaluateOnNewDocument(injectedScript)



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

    await page.setBypassCSP(true)


    if (url != null) await page.goto(url)
    let eventStep = new RecordingStep({ command: 'goto', target: url, iframe: '[]' })
    eventStep.parameter = url
    eventStep.finalLocator = 'FAKE locator to avoid check'
    eventStep.finalLocatorName = 'FAKE locator name to avoid check'
    logEvent(record)(eventStep)

    await page.setRequestInterception(true)

    page.on('request', async request => {
        if (request.isNavigationRequest()) {
            let isRecording = record.isRecording
            if (request.frame().parentFrame() != null) {
                //will not handle the call from frames
                await request.continue()
            }
            else if (record.htmlCaptureStatus.isHtmlCaptureOngoing) {
                //wait for 1s so that we have sufficient time to add step
                await new Promise(resolve => { setTimeout(resolve, 1000) })


                //stop capture if navigation pending
                record.isRecording = false



                await request.abort('aborted')

                await drawPendingWorkProgress(page, record.picCapture, record.htmlCaptureStatus)
                record.navigation.initialize(request.url(), request.method(), request.postData(), request.headers(), isRecording)

                await page.goto(request.url())

            }
            else if (record.navigation.isPending) {
                //handle navigation
                let data = record.navigation.getCurrentNavigationData()
                request.continue(data)
                record.navigation.redirect()

            }
            else {
                if (record.navigation.isPending == null) {
                    //resume the capture
                    record.isRecording = record.navigation.isRecording
                    record.navigation.complete()
                }
                request.continue()
            }


        } else {
            // await new Promise(resolve => { setTimeout(resolve, 1000) })
            request.continue();
        }
    })
    page.on('frameattached', async frame => {
        // console.log(frame)
    })


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
async function hideSpy(page, isSpyVisible) {
    if (isSpyVisible == true) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready

    await page.bringToFront()
    page.evaluate(() => {
        window.captureHtml()
        captureScreenshot()
    })


}

module.exports = { startRecording, endRecording, hideSpy, }