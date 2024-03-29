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
const stopRecording = require('./exposure/stopRecording')
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
    let page = null
    //start to watch the download event
    const download = new DownloadWatcher((record))
    await download.startWatching()


    //initialize recording object
    if (isCleanSteps) {
        record.steps = []
        record.isRecording = true
        record.isCaptureHtml = config.recording.captureHtml
    }
    else {
        //will not record steps by default
        record.isRecording = false
        record.isCaptureHtml = false
    }
    //update io for record
    record.puppeteer.setIO(io)
    record.puppeteer.setBrowser(browser)

    browser.on('targetcreated', async function (target) {
        //if we are not actively tracking tab creation, we will return
        //this feature is setup to avoid recording bluestone's tab
        if (!record.puppeteer.isTrackTabCreation) {
            return
        }
        let startTime = Date.now()
        /** @type {import('puppeteer').Page} */
        let page = await target.page()
        let endTime = Date.now()
        console.log(endTime - startTime)
        //as we press ctrl+q, it will trigger target created event. Not quite sure what it means
        if (page == null) {
            return
        }
        let pageIndex = record.puppeteer.pageList.length + 1
        record.puppeteer.setPage(page)
        record.puppeteer.addPageToPageList(page)
        //initialize alert watcher
        const alert = new AlertWatcher(record, page, logEvent)
        await alert.startWatching()


        //inject event watcher and expose supporting function
        let eventRecorderPath = path.join(__dirname, './injection/eventRecorder.js')
        await injectModuleScriptBlock(page, eventRecorderPath, pageIndex)

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
        await page.exposeFunction('stopRecording', stopRecording(record))
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
        let client = await page.target().createCDPSession()
        await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: download.downloadFolder });

        console.log('new page loaded correctly')
    })


    for (let i = 0; i < url.split(',').length; i++) {
        let link = url.split(',')[i]
        page = await browser.newPage();
        if (url != null) {
            for (let i = 0; i < 5; i++) {
                try {
                    await page.goto(link)
                    break
                } catch (error) {
                    console.log('Unable to go to ' + link)
                }
            }
            await page.reload()
        }
    }


    //automatically focus main frame body as we perform initial navigation
    // do this in avoid click on the screen at first before you can call ctrl+q
    await page.focus('body')
    let eventStep = new RecordingStep({ command: 'goto', target: url, iframe: '[]' })
    eventStep.parameter = url
    eventStep.finalLocator = 'FAKE locator to avoid check'
    eventStep.finalLocatorName = 'FAKE locator name to avoid check'
    logEvent(record)(eventStep)

    //launch bluestone console
    await record.puppeteer.openBluestoneTab('workflow')
    await page.bringToFront()
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