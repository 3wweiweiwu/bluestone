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
    const minimumCaptureIntervalMs = 100
    let main = async function (isMainThread = false) {
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
        if (page != null && recordRepo.isRecording && recordRepo.isCaptureHtml) {
            let htmlPath = recordRepo.getHtmlPath()
            try {
                if (session == null) {

                }
                let mHtmlData = null
                try {
                    const { data } = await session.send('Page.captureSnapshot');
                    mHtmlData = data
                } catch (error) {
                    session = await page.target().createCDPSession();
                    await session.send('Page.enable');
                }
                fs.writeFile(htmlPath, mHtmlData)
                recordRepo.htmlCaptureStatus.pushOperation()

            } catch (error) {

            }
        }
        taskQueue.shift()
        if (taskQueue.length > 0) {
            main(taskQueue[0], true)
        }

    }
    return main
}