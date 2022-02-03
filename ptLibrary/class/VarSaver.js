const DownloadManager = require('./VarContext/DownloadManager')
class VarSaver {
    /**
     * 
     * @param {string} currentFileName The name of the current file
     */
    constructor(currentFileName) {
        this.currentFileName = currentFileName
        this.downloadManager = new DownloadManager()
    }
}
module.exports = VarSaver