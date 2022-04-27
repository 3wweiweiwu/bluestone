const DownloadManager = require('./VarContext/DownloadManager')
const AlertManager = require('./VarContext/AlertManager')
const HealingInfo = require('./VarContext/HealingReport')
const path = require('path')
const { Page } = require('puppeteer')
class VarSaver {
    /**
     * @param {Page} page
     * @param {string} currentFilePath The name of the current file
     */
    constructor(currentFilePath, currentRetryCount) {
        this.currentFilePath = currentFilePath
        this.retryCount = currentRetryCount
        this.testcase = (path.basename(currentFilePath).toLowerCase().split('.js'))[0]
        this.projectRootPath = currentFilePath.split('script')[0]
        this.dataOutDir = this.initializeDataOutDir(this.currentFilePath)
        this.dataSnapshotdir = path.join(this.projectRootPath, '/data/', this.testcase, '/snapshot/')
        this.downloadManager = new DownloadManager()
        this.alertManager = new AlertManager()
        this.healingInfo = new HealingInfo(process.env.RUN_ID, this.projectRootPath, this.testcase)
        this.tcStepInfo = null
        this.exportVarContextToEnv()

    }
    /**
     * Get snapshot information
     * @param {string} snapshotName the name of the snapshot
     * @returns {string}
     */
    getSnapshot(snapshotName) {
        return path.join(this.dataSnapshotdir, snapshotName + ".json")
    }
    exportVarContextToEnv() {
        let jsonStr = JSON.stringify(this)
        process.env.BLUESTONE_VAR_SAVER = jsonStr
    }
    /**
     * Parse simplified bluestone variable from process env variable
     * @returns {VarSaver}
     */
    static parseFromEnvVar() {
        if (process.env.BLUESTONE_VAR_SAVER == null) {
            console.log('Unable to find bluestone var info in the env vars!')
            return new VarSaver('', 0)
        }

        /**@type {VarSaver} */
        let varSav = JSON.parse(process.env.BLUESTONE_VAR_SAVER)
        varSav.healingInfo = new HealingInfo(process.env.RUN_ID, varSav.projectRootPath, varSav.testcase)
        return varSav
    }
    initializeAutoHealingDir(rootFolder, executionId, HealingReportPath) {

    }
    initializeDataOutDir(filePath) {
        let fileName = path.basename(filePath).toLowerCase().replace('.js', '')
        let rootDir = filePath.split('\\script\\')[0]

        let dataOutDir = path.join(rootDir, '/data/out/', fileName)
        return dataOutDir
    }
}
module.exports = VarSaver