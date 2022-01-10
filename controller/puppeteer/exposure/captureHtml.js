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
            const maxConcurrentWorker = 1
            const maxWaitingWorker = 1
            try {
                if (recordRepo.htmlCaptureStatus.getPendingItems().length < maxConcurrentWorker + maxWaitingWorker) {
                    htmlIndex = recordRepo.htmlCaptureStatus.pushOperation('', htmlPath)
                    let currentPendingQueue = recordRepo.htmlCaptureStatus.__queue
                    do {
                        try {
                            currentPendingQueue = recordRepo.htmlCaptureStatus.getPendingItemBeforeIndex(htmlIndex)
                        } catch (error) {
                            console.log(error)
                        }
                        //will not wait if I am first item
                        if (currentPendingQueue.length < maxConcurrentWorker) {
                            break
                        }
                        await new Promise(resolve => setTimeout(resolve, 100))
                    }
                    while (currentPendingQueue.length >= maxConcurrentWorker)
                }
                else {
                    return
                }
            } catch (error) {
                console.log(error)
            }



            try {
                htmlPath = recordRepo.htmlCaptureStatus.markWriteStarted(htmlIndex)
                let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
                    const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
                    return pageData;
                }, config.singlefile)

                recordRepo.operation.browserSelection.selectorHtmlPath = htmlPath
                if (recordRepo.htmlCaptureStatus.lastHtml == pageData.content) {
                    recordRepo.htmlCaptureStatus.updateHtmlPath(htmlIndex, recordRepo.htmlCaptureStatus.lastFilePath)
                    recordRepo.htmlCaptureStatus.markWriteDone(htmlIndex)
                }
                else {
                    recordRepo.htmlCaptureStatus.lastHtml = pageData.content
                    recordRepo.htmlCaptureStatus.lastFilePath = htmlPath
                    recordRepo.htmlCaptureStatus.markWriteDone(htmlIndex)

                    fs.writeFile(htmlPath, pageData.content)
                        .then(() => {

                        })
                }

            } catch (error) {
                console.log(error)
                recordRepo.htmlCaptureStatus.popOperation(htmlIndex)
            }


        }

    }
}