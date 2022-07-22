// const singlefileScript = require('single-file/cli/back-ends/common/scripts')
const pageCaptureConfig = require('../../config').singlefile
const VarSaver = require('../class/VarSaver')
const { Page } = require('puppeteer')
const fs = require('fs').promises
const os = require('os')
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
        // const injectedScript = await singlefileScript.get(pageCaptureConfig);
        // await page.evaluateOnNewDocument(injectedScript)
    } catch (error) {
        console.log('In retry-mode yet we cannot inject single file library to capture html')
    }


}
/**
 * capture html and save result in the designated step folder
 * @param {string} pageData
 * @returns {string} //file path
 */
async function captureSnapshot(pageData) {
    //get env variable
    try {
        let varSav = VarSaver.parseFromEnvVar()
        let extensionName = 'png'
        if (varSav.isTakeSnapshot == false) {
            return ''
        }

        //Based on call stack, get curret step's info
        let err = new Error()
        let stack = err.stack
        let filePath = path.join(os.tmpdir(), 'stepSnapshot.png')
        try {
            //if we are in execution mode, we will output file to desinated folder
            let stepIndex = getErrorStepIndexByStack(varSav.currentFilePath, stack, varSav.tcStepInfo)
            //output html 
            let fileName = `step-${stepIndex.toString()}-${Date.now()}.${extensionName}`
            //depends on the run sceanrio, output report in different place
            filePath = path.join(varSav.dataOutDir, fileName)
            await fs.writeFile(filePath, pageData)
            varSav.ScreenshotReportManager.updateRecord(stepIndex, filePath)
            varSav.exportVarContextToEnv()
        } catch (error) {
            console.log(error)
        }


        return filePath
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
    // let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
    //     const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
    //     return pageData;
    // }, pageCaptureConfig)
    // return pageData
}
module.exports = { initializePageCapture, captureSnapshot }