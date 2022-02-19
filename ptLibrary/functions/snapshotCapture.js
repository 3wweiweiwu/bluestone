const singlefileScript = require('single-file/cli/back-ends/common/scripts')
const pageCaptureConfig = require('../../config').singlefile
const VarSaver = require('../class/VarSaver')
const { Page } = require('puppeteer')
const fs = require('fs').promises
const path = require('path')
const getErrorStepIndexByStack = require('./getErrorStepIndexByStack')
/**
 * inject single page engine into the page in order to capture real-time web page interaction
 * @param {Page} page 
 */
async function initializePageCapture(page) {
    try {
        //only inject the function when we are in re-execution mode
        //Do this in order to save time in normal execution
        let varSav = VarSaver.parseFromEnvVar()
        if (varSav.retryCount == 0) return

        //in retry mode
        const injectedScript = await singlefileScript.get(pageCaptureConfig);
        await page.evaluateOnNewDocument(injectedScript)
    } catch (error) {
        console.log('In retry-mode yet we cannot inject single file library to capture html')
    }


}
/**
 * capture html and save result in the designated step folder
 * @param {Page} page 
 * @returns {string}
 */
async function captureSnapshot(page) {
    //get env variable
    try {
        let varSav = VarSaver.parseFromEnvVar()
        let pageData = null
        let extensionName = ''
        //only run under retry mode
        if (varSav.retryCount == 0) {
            pageData = await page.screenshot({ type: 'png' })
            extensionName = 'png'
        }
        else {
            pageData = (await captureHtmlSnapshot(page)).content
            extensionName = 'html'
        }
        //in retry mode



        //Based on call stack, get curret step's info
        let err = new Error()
        let stack = err.stack
        let stepIndex = getErrorStepIndexByStack(varSav.currentFilePath, stack, varSav.tcStepInfo)

        //output html 
        let fileName = `step-${stepIndex.toString()}-${Date.now()}.${extensionName}`
        let filePath = path.join(varSav.dataOutDir, fileName)
        await fs.writeFile(filePath, pageData)

        return pageData
    } catch (error) {
        console.log('Unable to capture current HTML snapshot. Error:' + error.toString())
    }

}
/**
 * Capture HTML snapshot
 * @param {Page} page 
 * @returns 
 */
async function captureHtmlSnapshot(page) {
    //save current html 
    let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
        const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
        return pageData;
    }, pageCaptureConfig)
    return pageData
}
module.exports = { initializePageCapture, captureSnapshot }