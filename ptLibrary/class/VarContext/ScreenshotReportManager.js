let fs = require('fs')
let path = require('path')

class ScreenshotRecord {
    constructor(tcId, lineNumber, picPath, mhtmlPath, retryCount, recordIndex) {
        this.tcId = tcId
        this.lineNumber = lineNumber
        this.picPath = picPath
        this.mhtmlPath = mhtmlPath
        this.retryCount = retryCount
        this.recordIndex = recordIndex
    }
}
class ScreenshotReportManager {
    /**
     * 
     * @param {string} runId the run id of current execution
     * @param {string} prescriptionFolder 
     * @param {string} tcId name of the testcase
     */
    constructor(runId, prescriptionFolder, tcId, records = [], currentLineNumber = null, currentRecordIndex = null) {

        this.prescriptionFolder = prescriptionFolder
        //if we are not in recoded execution, we will not copy file to prescription folder
        if (runId == '' || runId == null) {
            this.prescriptionFolder = ''
        }
        /**@type {ScreenshotRecord[]} */
        this.records = records
        this.tcId = tcId
        if (currentLineNumber == null)
            this.currentLineNumber = -1
        else
            this.currentLineNumber = currentLineNumber

        if (currentRecordIndex == null)
            this.currentRecordIndex = 0
        else
            this.currentRecordIndex = currentRecordIndex


    }
    /**
     * Update execution record in the json file
     * @param {number} lineNumber the line number of current testcase
     * @param {string} picPath the path of the picture
     * @param {string} mhtmlPath the path of the mhtml
     * @param {number} retryCount number of retry we are in
     */
    updateRecord(lineNumber, picPath, mhtmlPath, retryCount) {
        let tcId = this.tcId

        //update record index based on line number
        if (lineNumber != this.currentLineNumber) {
            this.currentLineNumber = lineNumber
            this.currentRecordIndex = 0
        }
        this.currentRecordIndex++
        if (this.prescriptionFolder != '' && this.prescriptionFolder != null) {
            let fileName = `${tcId}-${lineNumber}-${retryCount}-${this.currentRecordIndex}`
            let filePath = path.join(this.prescriptionFolder, `${fileName}.png`)
            fs.copyFileSync(picPath, filePath)
            picPath = filePath

            filePath = path.join(this.prescriptionFolder, `${fileName}.mhtml`)
            fs.copyFileSync(mhtmlPath, filePath)
            mhtmlPath = filePath
        }
        let newRecord = new ScreenshotRecord(tcId, lineNumber, picPath, mhtmlPath, retryCount, this.currentRecordIndex)
        this.records.push(newRecord)


    }
}

module.exports = ScreenshotReportManager