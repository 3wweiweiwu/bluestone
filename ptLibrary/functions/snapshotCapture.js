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
    const injectedScript = await singlefileScript.get(pageCaptureConfig);
    await page.evaluateOnNewDocument(injectedScript)

}
/**
 * capture html and save result in the designated step folder
 * @param {Page} page 
 * @returns {string}
 */
async function captureHtml(page) {
    //get env variable
    let varSav = VarSaver.parseFromEnvVar()

    //save current html 
    let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
        const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
        return pageData;
    }, pageCaptureConfig)

    //Based on call stack, get curret step's info
    let err = new Error()
    let stack = err.stack
    let stepIndex = getErrorStepIndexByStack(varSav.currentFilePath, stack, varSav.tcStepInfo)

    //output html 
    let fileName = `step-${stepIndex.toString()}-${Date.now()}.html`
    let filePath = path.join(varSav.dataOutDir, fileName)
    await fs.writeFile(filePath, pageData.content)

    return pageData
}
module.exports = { initializePageCapture, captureHtml }