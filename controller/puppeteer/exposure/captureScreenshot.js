const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')
const config = require('../../../config')
/**
 * Continuously capture html snapshot and save it to the disk
 * @param {Page} page 
 * @param {WorkflowRecord} recordRepo
 */
module.exports = function (page, recordRepo) {
    let id = Math.random()
    let isCaptureOngoing = false
    return async function (reason) {
        if (page != null && recordRepo.isRecording && !isCaptureOngoing) {

            isCaptureOngoing = true
            //capture html

            let picPath = recordRepo.getPicPath()
            let index = recordRepo.picCapture.pushOperation('', picPath)
            try {

                //stop capturing any screenshot that is current page is not active
                if (page == recordRepo.puppeteer.page) {
                    await page.screenshot({ path: picPath, captureBeyondViewport: false })
                    recordRepo.picCapture.markCaptureDone(index)
                }
                recordRepo.picCapture.popOperation()
            } catch (error) {
                recordRepo.picCapture.popOperation()
            }
            isCaptureOngoing = false
            // console.log(id)

        }

    }
}