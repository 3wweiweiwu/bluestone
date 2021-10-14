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
        if (recordRepo.isRecording) {

            recordRepo.operation.browserSelection.currentSelector = selector
            recordRepo.operation.browserSelection.currentInnerText = innerText
            recordRepo.operation.browserSelection.x = x
            recordRepo.operation.browserSelection.y = y
            recordRepo.operation.browserSelection.height = height
            recordRepo.operation.browserSelection.width = width
            recordRepo.operation.browserSelection.lastOperationTimeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime

            //handle page capture
            let htmlPath = ''
            if (page != null) {
                htmlPath = recordRepo.getHtmlPath()
                recordRepo.operation.browserSelection.selectorHtmlPath = htmlPath

                let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {

                    const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
                    return pageData;
                }, config.singlefile);
                fs.writeFile(htmlPath, pageData.content)

            }

            //handle screenshot
            let picturePath = ''
            if (page != null) {
                picturePath = recordRepo.getPicPath()
                recordRepo.operation.browserSelection.selectorPicture = picturePath
                await page.screenshot({ path: picturePath, captureBeyondViewport: false })

                let pic = await jimp.read(picturePath)

                //for ordinary event, just crop as usual
                pic = pic.crop(x, y, width, height);
                pic.writeAsync(picturePath)

            }


        }

    }
}