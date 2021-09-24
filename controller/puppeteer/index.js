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



    await page.exposeFunction('logEvent', logEvent(record, page, io))
    await page.exposeFunction('isRecording', isRecording(record))
    await page.exposeFunction('logCurrentElement', logCurrentElement(record))
    await page.exposeFunction('getLocator', getLocator(record))
    await page.exposeFunction('setLocatorStatus', setLocatorStatus(record))
    await page.exposeFunction('isSpyVisible', isSpyVisible(record))
    await page.exposeFunction('setSpyVisible', setSpyVisible(record))
    await page.exposeFunction('runPtFunc', runPtFunc(record, browser, page, io))


    page.on('load', (event, WorkflowRecord) => {
        try {
            page.evaluate(() => {
                //add iframe
                setTimeout(() => {
                    let bluestone_inbrowser_console = document.getElementById('bluestone_inbrowser_console')
                    // console.log(bluestone_inbrowser_console)
                    if (bluestone_inbrowser_console != null) return
                    bluestone_inbrowser_console = document.createElement("iframe");
                    bluestone_inbrowser_console.setAttribute('id', 'bluestone_inbrowser_console')
                    bluestone_inbrowser_console.setAttribute('src', 'http://localhost:3600/spy')
                    //mark item as invisible 
                    if (window.isSpyVisible() == false) {
                        bluestone_inbrowser_console.style.display = 'none'
                    }
                    else {
                        bluestone_inbrowser_console.style.display = 'block'
                    }
                    bluestone_inbrowser_console.style.position = 'fixed'
                    bluestone_inbrowser_console.style['text-align'] = 'center'
                    bluestone_inbrowser_console.style['width'] = '600px'
                    bluestone_inbrowser_console.style['height'] = '600px'

                    bluestone_inbrowser_console.style.top = '30%'
                    bluestone_inbrowser_console.style.left = `30%`
                    document.body.appendChild(bluestone_inbrowser_console);
                }, 800);

            })
        } catch (error) {
            console.log()
        }
    })


    await page.setBypassCSP(true)


    if (url != null) await page.goto(url)
    let eventStep = new RecordingStep({ command: 'goto', target: url })
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
 * hide in-browser spy
 * @param {import('puppeteer').Page} page 
 */
async function hideSpy(page, isSpyVisible) {
    if (isSpyVisible == true) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready

    await page.evaluate(() => {
        document.querySelector("#bluestone_inbrowser_console").style.display = 'none'
    })



}
/**
 * run current opeation if runCurrentOperation argument is true
 * @param {import('puppeteer').Page} page 
 */
async function runCurrentOperation(page, runCurrentOperation) {
    if (runCurrentOperation == false) return

    //if spy is invisible, set attribute
    //the fist time we run it, page object may not be ready

    await page.evaluate(() => {
        window.runPtFunc()
    })



}
module.exports = { startRecording, endRecording, hideSpy, runCurrentOperation }