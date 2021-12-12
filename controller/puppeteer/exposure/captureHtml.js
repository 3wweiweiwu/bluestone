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

    return async function () {
        if (page != null && recordRepo.isRecording) {
            //Use queue to avoid repeated capture for a short period of time to enhance performance
            //when there is more than 1 item, add a waiting queue, if there are more action being taken while we are waiting,
            //the subsequent action will be cancelled because it is waiting for the same thing
            //taking multiple same picture will not help
            //the html will be captured while the queue is empty
            const maxQueue = 1
            let currentQueue = recordRepo.htmlCaptureStatus.getPendingItems()
            if (currentQueue == maxQueue) {
                while (recordRepo.htmlCaptureStatus.getPendingItems() >= maxQueue) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }
            }
            else if (currentQueue > maxQueue) {
                return
            }


            let htmlPath = recordRepo.getHtmlPath()
            let htmlIndex = recordRepo.htmlCaptureStatus.pushOperation('', htmlPath)
            try {
                let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
                    const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
                    return pageData;
                }, config.singlefile)

                recordRepo.operation.browserSelection.selectorHtmlPath = htmlPath
                fs.writeFile(htmlPath, pageData.content)
                    .then(() => {
                        recordRepo.htmlCaptureStatus.markWriteReady(htmlIndex)
                    })

                recordRepo.htmlCaptureStatus.popOperation()
            } catch (error) {
                recordRepo.htmlCaptureStatus.popOperation()
            }


        }

    }
}