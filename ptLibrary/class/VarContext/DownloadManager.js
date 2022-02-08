let os = require('os')
let path = require('path')
class DownloadManager {
    constructor() {
        this.downloading = []
        this.downloaded = []
        this.downloadFolder = path.join(os.tmpdir(), 'bluestone-download-' + Date.now().toString())
        this.__completedDownloadCount = 0
    }
    startDownload(filePath) {
        this.downloading.push(filePath)
    }
    __addCompletedCount() {
        this.__completedDownloadCount++
    }
    __resetCompletedCount() {
        this.__completedDownloadCount = 0
    }
    completeDownload(filePath) {
        this.downloading = this.downloading.filter(item => item != filePath)
        this.downloaded = this.downloaded.filter(item => item != filePath)
        this.downloaded.push(filePath)
        this.__addCompletedCount()
    }
    async waitDownloadComplete(timeout) {
        let completeStatus = false
        let startTime = Date.now()
        //wait for 1.5s with the hope that download should start by then
        await new Promise(resolve => setTimeout(resolve, 1500))
        let elapsedTime
        do {
            elapsedTime = Date.now() - startTime
            //if item completed within wait period, we are all good
            if (this.__completedDownloadCount > 0) {
                completeStatus = true
                this.__resetCompletedCount()
                break
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        while (elapsedTime < timeout && this.downloading.length > 0)

        if (completeStatus) {
            return true
        }
        else {
            throw new Error(`Unable to download file within ${timeout}ms`)
        }
    }
}
module.exports = DownloadManager