const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')
const config = require('../../../config')
const fs = require('fs').promises
const jimp = require('jimp')
/**
 * Continuously capture html snapshot and save it to the disk
 * @param {Page} page 
 * @param {WorkflowRecord} recordRepo
 */
module.exports = function (page, recordRepo) {

    return async function () {
        if (page != null && recordRepo.isRecording) {
            //capture html

            let picPath = recordRepo.getPicPath()
            let index = recordRepo.picCapture.pushOperation('', picPath)
            try {
                await page.screenshot({ path: picPath, captureBeyondViewport: false })

                recordRepo.picCapture.markCaptureDone(index)

                recordRepo.picCapture.popOperation()
            } catch (error) {
                recordRepo.picCapture.popOperation()
            }


        }

    }
}