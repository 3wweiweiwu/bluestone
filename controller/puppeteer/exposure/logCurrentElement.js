const { WorkflowRecord } = require('../../record/class/index')
const fs = require('fs').promises
const config = require('../../../config')
/**
 * Log element where mouse point to the workflow recorder element
 * @param {WorkflowRecord} recordRepo 
 * @param {import('puppeteer-core').Page} page
 */
module.exports = function logCurrentElement(recordRepo, page) {

    return async function (selector = '', innerText = '', x, y, height, width, parentFrame, potentialMatch, framePotentialMatch, currentSelectedIndex, recommendedLocator) {
        //if current selector has been captured, we will not capture it again
        if (selector == recordRepo.operation.browserSelection.currentSelector && x == recordRepo.operation.browserSelection.x && recordRepo.operation.browserSelection.y == y) {
            return
        }
        if (recordRepo.isRecording && recordRepo.isCaptureHtml) {
            recordRepo.operation.browserSelection.currentSelector = selector
            recordRepo.operation.browserSelection.currentInnerText = innerText
            recordRepo.operation.browserSelection.x = x
            recordRepo.operation.browserSelection.y = y
            recordRepo.operation.browserSelection.height = height
            recordRepo.operation.browserSelection.width = width
            recordRepo.operation.browserSelection.lastOperationTimeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime
            recordRepo.operation.browserSelection.parentIframe = []
            recordRepo.operation.browserSelection.recommendedLocator = recommendedLocator
            try {
                recordRepo.operation.browserSelection.parentIframe = JSON.parse(parentFrame)
            } catch (error) {

            }

            recordRepo.operation.browserSelection.potentialMatch = []
            try {
                let matchedList = JSON.parse(potentialMatch)
                for (index of matchedList) {
                    let locatorObj = JSON.parse(JSON.stringify(recordRepo.locatorManager.locatorLibrary[index]))
                    recordRepo.operation.browserSelection.potentialMatch.push(locatorObj)
                }


            } catch (error) {

            }

            recordRepo.operation.browserSelection.framePotentialMatch = []
            try {
                let matchedList = JSON.parse(framePotentialMatch)
                for (index of matchedList) {
                    let locatorObj = JSON.parse(JSON.stringify(recordRepo.locatorManager.locatorLibrary[index]))
                    recordRepo.operation.browserSelection.framePotentialMatch.push(locatorObj)
                }


            } catch (error) {

            }

            recordRepo.operation.browserSelection.currentSelectedIndex = currentSelectedIndex
            //handle screenshot
            let picturePath = recordRepo.getPicPath()
            recordRepo.operation.browserSelection.selectorPicture = picturePath
            recordRepo.picCapture.outputCurrentPic(x, y, width, height, picturePath)


        }

    }
}