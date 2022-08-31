const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')
const config = require('../../../config')
const fs = require('fs').promises

/**
 * Continuously capture html snapshot and save it to the disk
 * @param {Page} page 
 * @param {WorkflowRecord} recordRepo
 */
module.exports = function (page, recordRepo) {
    let session = null
    let taskQueue = []
    let lastRunTime = Date.now()
    const minimumCaptureIntervalMs = 50
    let main = async function (reason, isMainThread = false) {
        if (page != null && recordRepo.isRecording && recordRepo.isCaptureHtml) {
            if (taskQueue.length >= 2 && isMainThread == false) {
                return
            }
            if (taskQueue.length == 1 && isMainThread == false) {
                taskQueue.push(reason)
                return
            }
            if (taskQueue.length == 0) {
                taskQueue.push(reason)
            }
            let mHtmlPath = recordRepo.getMhtmlPath()
            recordRepo.puppeteer.sendCapturingHtml()
            try {
                if (session == null) {
                    session = await page.target().createCDPSession();
                    await session.send('Page.enable');
                }
                let mHtmlData = null
                try {
                    const { data } = await session.send('Page.captureSnapshot');
                    mHtmlData = data
                } catch (error) {
                    session = await page.target().createCDPSession();
                    await session.send('Page.enable');
                }
                fs.writeFile(mHtmlPath, mHtmlData)
                recordRepo.htmlCaptureStatus.pushOperation(null, mHtmlPath)

            } catch (error) {

            }
        }
        recordRepo.puppeteer.sendCaptureHtmlComplete()
        taskQueue.shift()
        if (taskQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, minimumCaptureIntervalMs))
            main(taskQueue[0], true)
        }

    }
    return main
}