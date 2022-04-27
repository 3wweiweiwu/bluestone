const fs = require('fs')
const path = require('path')
const TestcaseLoader = require('../../../controller/ast/TestCaseLoader')
const getErrorStepIndexByErrorStack = require('../../functions/getErrorStepIndexByStack')
class HealingRecord {
    constructor(locatorName, newLocator, oldLocator, newLocatorSnapshotPath, failureStepIndex) {
        this.locatorName = locatorName
        this.newLocator = newLocator
        this.oldLocator = oldLocator
        this.newLocatorSnapshotPath = newLocatorSnapshotPath
        this.failureStepIndex = failureStepIndex
    }
}
class LocatorUsage {
    constructor(locatorName) {
        this.locatorName = locatorName
        this.locatorPasseedInstance = 0
        this.locatorFailedInstance = 0
    }
}
class PrescriptionReport {
    constructor() {
        /** @type {Object.<string,HealingRecord[]>} */
        this.info = {}
    }

    /**
     * Add new perscription to the report. If current locator is working, clean up prior healing log
     * If current locator is not working and there is no prior record, add record
     * @param {string} testcaseName 
     * @param {string} locatorName 
     * @param {string} newLocator 
     * @param {string} oldLocator 
     * @param {number} failureStepIndex 
     * @param {boolean} isOriginalLocatorWork
     */
    addRecord(testcaseName, locatorName, newLocator, oldLocator, newLocatorSnapshotPath, failureStepIndex, isOriginalLocatorWork) {

        let healingRecord = new HealingRecord(locatorName, newLocator, oldLocator, newLocatorSnapshotPath, failureStepIndex)
        if (this.info[testcaseName] == null) {
            this.info[testcaseName] = []
        }
        let duplicateItem = this.info[testcaseName].find(item => item.locatorName == locatorName && item.failureStepIndex == failureStepIndex)

        if (isOriginalLocatorWork == true && duplicateItem != null) {
            //if current element is found by its orginal locator, we will remove previous locators
            this.info[testcaseName] = this.info[testcaseName].filter(item => item != duplicateItem)
        }
        else if (duplicateItem == null && isOriginalLocatorWork == false) {
            this.info[testcaseName].push(healingRecord)
        }

    }
    restore(info) {
        this.info = info.info
    }
}
class LocatorReport {
    constructor() {
        /**
         * @type {Object.<string,LocatorUsage>}
         */
        this.usage = {}
    }
    addRecord(locatorName, isPass) {
        if (this.usage[locatorName] == null) {
            this.usage[locatorName] = new LocatorUsage(locatorName)
        }
        if (isPass) {
            this.usage[locatorName].locatorPasseedInstance += 1
        }
        else {
            this.usage[locatorName].locatorFailedInstance += 1
        }
    }
    restore(info) {
        this.usage = info.usage
    }
}
class HealingInfo {
    /**
     * 
     * @param {string} runId 
     * @param {string} projectRootPath 
     * @param {string} testcaseName
     */
    constructor(runId = '', projectRootPath, testcaseName) {
        this.isHealingByLocator = true || process.env.HEALINGBYLOCATOR
        this.isHealingBySnapshot = true || process.env.HEALINGBYSNAPSHOT
        this.prescriptionReport = new PrescriptionReport()
        this.locatorReport = new LocatorReport()
        this.runId = runId
        this.perscriptionFolder = path.join(projectRootPath, 'result', 'prescription', runId, '/')
        this.prescriptionPath = path.join(this.perscriptionFolder, 'report.json')
        this.picPath = path.join(this.perscriptionFolder, `${testcaseName}-${Date.now().toString()}.png`)
        this.testcasName = testcaseName
        this.initialize(this.perscriptionFolder, this.prescriptionPath, this.runId)
    }
    /**
     * initialize current healing inforamtion.
     * @param {string} healingFolder 
     * @param {string} perscriptionPath 
     * @param {string} runId 
     */
    initialize(healingFolder, perscriptionPath, runId) {
        //if no runid information is psec
        if (this.runId == null || this.runId == '') return
        fs.mkdirSync(healingFolder, { recursive: true })
        try {
            fs.accessSync(perscriptionPath)
        } catch (error) {
            this.export(runId, perscriptionPath)
        }

        let content = (fs.readFileSync(perscriptionPath)).toString()
        /**@type {HealingInfo} */
        let obj = JSON.parse(content)
        this.prescriptionReport.restore(obj.prescriptionReport)
        this.locatorReport.restore(obj.locatorReport)
        console.log()
    }
    export(runId, perscriptionPath) {
        if (runId == null || runId == '') return
        let log = JSON.stringify(this)
        fs.writeFileSync(perscriptionPath, log)

    }
    /**
     * Create perscription if auto-healing finds a resonable locator
    * @param {string} testcasePath  
    * @param {string} locatorName 
     * @param {string} oldLocator 
     * @param {string} newLocator 
     * @param {string} pageData
     * @param {TestcaseLoader} testcase
     * @param {boolean} isOriginalLocatorWork
     */
    async createPerscription(locatorName, oldLocator, newLocator, pageData, testcasePath, testcase, isOriginalLocatorWork) {
        if (this.runId == null || this.runId == '') return
        //get step index information
        let err = new Error()
        let stepIndex = getErrorStepIndexByErrorStack(testcasePath, err.stack, testcase)


        this.locatorReport.addRecord(locatorName, isOriginalLocatorWork)
        if (pageData != null) {
            fs.writeFileSync(this.picPath, pageData)
        }

        let picPathBaseName = path.basename(this.picPath)
        this.prescriptionReport.addRecord(this.testcasName, locatorName, newLocator, oldLocator, picPathBaseName, stepIndex, isOriginalLocatorWork)

        this.export(this.runId, this.prescriptionPath)
    }
    /**
     * Current locator is found, record that for future decision-making on locator replacement
     * @param {string} locatorName 
     * @param {Boolean} isLocatorFound
     */
    async addWorkingLocatorRecord(locatorName, isLocatorFound = false) {
        if (this.runId == null || this.runId == '') return
        this.locatorReport.addRecord(locatorName, isLocatorFound)
        this.export(this.runId, this.prescriptionPath)
    }

}
module.exports = HealingInfo