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
        if (page != null && recordRepo.isRecording && recordRepo.htmlCaptureStatus.getPendingItems() < 3) {
            //capture html

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