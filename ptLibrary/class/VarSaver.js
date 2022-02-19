const DownloadManager = require('./VarContext/DownloadManager')
const fs = require('fs')
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
        this.dataOutDir = this.initializeDataOutDir(this.currentFilePath)
        this.downloadManager = new DownloadManager()
        this.isHealing = false
        this.tcStepInfo = null
        this.exportVarContextToEnv()

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
            throw new Error('Unable to find bluestone var info in the env vars!')
        }

        return JSON.parse(process.env.BLUESTONE_VAR_SAVER)
    }

    initializeDataOutDir(filePath) {
        let fileName = path.basename(filePath).toLowerCase().replace('.js', '')
        let rootDir = filePath.split('\\script\\')[0]

        let dataOutDir = path.join(rootDir, '/data/out/', fileName)
        return dataOutDir
    }
}
module.exports = VarSaver