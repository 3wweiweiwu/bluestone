const { Page } = require('puppeteer')
const bluestoneConfig = require('../../../config')
// const singlefileScript = require('single-file/cli/back-ends/common/scripts')
const TestcaseLoader = require('../../../controller/ast/TestCaseLoader')
class HtmlInfo {
    constructor(stepIndex, labelIndex) {
        this.stepIndex = stepIndex
        this.labelIndex = labelIndex
    }
}

class HtmlSnapshotManager {
    /**
     * 
     * @param {string} outDir output dir
     * @param {string} currentFilePath output dir
     * @param {Page} page puppeteer page object
     */
    constructor(outDir, page, currentFilePath) {
        /**@type {Dict<Array<HtmlInfo>>} */
        this.stepLibrary = {}
        this.outDir = outDir
        this.page = page
        this.testcase = new TestcaseLoader(currentFilePath)
    }
    addStep() {
        let stepInfo = this.stepLibrary[stepIndex]
        let labelIndex = 0
        if (stepInfo == null) {
            this.stepLibrary[stepIndex] = []
        }
        else {
            labelIndex = stepInfo.length
        }
    }
    captureHtml() {
        // singlefileScript.get(bluestoneConfig.singlefile)
        // let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {
        //     const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
        //     return pageData;
        // }, bluestoneConfig.singlefile)
    }
}
module.exports = HtmlSnapshotManager