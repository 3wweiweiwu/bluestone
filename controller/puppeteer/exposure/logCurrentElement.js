const { WorkflowRecord } = require('../../record/class/index')
const jimp = require('jimp')
const fs = require('fs').promises
const config = require('../../../config')
/**
 * Log element where mouse point to the workflow recorder element
 * @param {WorkflowRecord} recordRepo 
 * @param {import('puppeteer-core').Page} page
 */
module.exports = function (recordRepo, page) {

    return async function (selector = '', innerText = '', x, y, height, width) {
        //if current selector has been captured, we will not capture it again
        if (selector == recordRepo.operation.browserSelection.currentSelector && x == recordRepo.operation.browserSelection.x && recordRepo.operation.browserSelection.y == y) {
            return
        }
        if (recordRepo.isRecording) {
            recordRepo.operation.browserSelection.currentSelector = selector
            recordRepo.operation.browserSelection.currentInnerText = innerText
            recordRepo.operation.browserSelection.x = x
            recordRepo.operation.browserSelection.y = y
            recordRepo.operation.browserSelection.height = height
            recordRepo.operation.browserSelection.width = width
            recordRepo.operation.browserSelection.lastOperationTimeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime

            //handle screenshot
            let picturePath = recordRepo.getPicPath()
            recordRepo.operation.browserSelection.selectorPicture = picturePath
            recordRepo.picCapture.outputCurrentPic(x, y, width, height, picturePath)


        }

    }
}