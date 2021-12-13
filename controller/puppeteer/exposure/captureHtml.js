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
            let htmlPath = recordRepo.getHtmlPath()
            let htmlIndex = null
            //Use queue to avoid repeated capture for a short period of time to enhance performance
            //when there is more than 1 item, add a waiting queue, if there are more action being taken while we are waiting,
            //the subsequent action will be cancelled because it is waiting for the same thing
            //taking multiple same picture will not help
            //the html will be captured while the queue is empty

            //# of simoutaneous html capture session
            const maxQueue = 1
            try {
                if (recordRepo.htmlCaptureStatus.getPendingItems() <= maxQueue + 1) {
                    htmlIndex = recordRepo.htmlCaptureStatus.pushOperation('', htmlPath)
                    let currentPendingQueue = recordRepo.htmlCaptureStatus.__queue
                    do {
                        try {
                            currentPendingQueue = recordRepo.htmlCaptureStatus.getPendingItemBeforeFileName(htmlPath, currentPendingQueue)
                        } catch (error) {
                            console.log(error)
                        }
                        //will not wait if I am first item
                        if (currentPendingQueue.length == 0) {
                            break
                        }
                        if (currentPendingQueue.length > maxQueue) {
                            recordRepo.htmlCaptureStatus.popOperation(htmlPath)
                            return
                        }
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }
                    while (currentPendingQueue.length >= maxQueue)
                }
                else {
                    return
                }
            } catch (error) {
                console.log(error)
            }



            try {
                recordRepo.htmlCaptureStatus.markWriteStarted(htmlPath)
                let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
                    const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
                    return pageData;
                }, config.singlefile)

                recordRepo.operation.browserSelection.selectorHtmlPath = htmlPath
                fs.writeFile(htmlPath, pageData.content)
                    .then(() => {
                        recordRepo.htmlCaptureStatus.markWriteReady(htmlPath)
                    })
            } catch (error) {
                console.log(error)
                recordRepo.htmlCaptureStatus.popOperation(htmlPath)
            }


        }

    }
}