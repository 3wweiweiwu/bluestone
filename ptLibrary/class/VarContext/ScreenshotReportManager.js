let fs = require('fs')
let path = require('path')

class ScreenshotRecord {
    constructor(tcId, lineNumber, picPath, mhtmlPath) {
        this.tcId = tcId
        this.lineNumber = lineNumber
        this.picPath = picPath
        this.mhtmlPath = mhtmlPath
    }
}
class ScreenshotReportManager {
    /**
     * 
     * @param {string} runId the run id of current execution
     * @param {string} prescriptionFolder 
     * @param {string} tcId name of the testcase
     */
    constructor(runId, prescriptionFolder, tcId, records = []) {

        this.prescriptionFolder = prescriptionFolder
        //if we are not in recoded execution, we will not copy file to prescription folder
        if (runId == '' || runId == null) {
            this.prescriptionFolder = ''
        }
        /**@type {ScreenshotRecord[]} */
        this.records = records
        this.tcId = tcId
    }
    updateRecord(lineNumber, picPath, mhtmlPath) {
        let tcId = this.tcId
        if (this.prescriptionFolder != '' && this.prescriptionFolder != null) {
            let filePath = path.join(this.prescriptionFolder, `${tcId}-${lineNumber}.png`)
            fs.copyFileSync(picPath, filePath)
            picPath = filePath

            filePath = path.join(this.prescriptionFolder, `${tcId}-${lineNumber}.mhtml`)
            fs.copyFileSync(mhtmlPath, filePath)
            mhtmlPath = filePath
        }
        let newRecord = new ScreenshotRecord(tcId, lineNumber, picPath, mhtmlPath)
        //remove existing picture if there is any
        let existingRecord = this.records.find(item => item.lineNumber == lineNumber && this.tcId == item.tcId)
        //add new entry
        if (existingRecord == null) {
            this.records.push(newRecord)
        }

    }
}

module.exports = ScreenshotReportManager