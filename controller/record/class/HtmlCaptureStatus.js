const fs = require('fs').promises
const { constants } = require('fs')
class HtmlCaptureEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     * @param {boolean} isWriteReady true=write done false=still writing null=waiting for pick up
     */
    constructor(selector, path, isWriteReady = null) {
        this.timeStamp = Date.now()
        this.selector = selector
        this.path = path
        this.writeReady = isWriteReady
        this.outputPath = []
    }
}
class HtmlCaptureStatus {
    constructor() {
        /** @type {Array<HtmlCaptureEntry>} */
        this.__queue = []
        this.__popIndex = -1
        this.__lastHtml = ''
        this.__lastFilePath = ''
    }
    get lastFilePath() {
        return this.__lastFilePath
    }
    set lastFilePath(path) {
        this.__lastFilePath = path
    }
    get lastHtml() {
        return this.__lastHtml
    }
    set lastHtml(html) {
        this.__lastHtml = html
    }
    get isHtmlCaptureOngoing() {

        if (this.getPendingItems().length > 0) {
            return true
        }
        else {
            return false
        }
    }
    getPendingItems() {
        return this.getPendingItemBeforeFileName()
    }
    /**
     * Get pending item before specific index
     * @param {string} fileName 
     * @param {Array<HtmlCaptureEntry>} queue
     * @returns {Array<HtmlCaptureEntry>}
     */
    getPendingItemBeforeFileName(fileName = null, queue = null) {
        let waitingWorker = this.getWorkerAtState(null, fileName, queue)
        let workingWorker = this.getWorkerAtState(false, fileName, queue)
        let totalWorker = workingWorker.concat(waitingWorker)
        return totalWorker
    }
    /**
     * returns worker before filename that is in a particular state
     * @param {boolean} state 
     * @param {string} fileName 
     * @param {Array<HtmlCaptureEntry>} queue 
     * @returns {Array<HtmlCaptureEntry>}
     */
    getWorkerAtState(state, fileName = null, queue = null) {
        //populate fileName
        if (fileName == null) {
            fileName = 'this is name that will never be hit. It will ensure we loop through the whole queue'
        }
        //populate queue
        if (queue == null) {
            queue = this.__queue
        }
        let newQueue = []
        for (let i = 0; i < queue.length; i++) {
            let entry = queue[i]
            //if we find current file name, just stop
            if (entry.path == fileName) {
                break
            }
            try {
                if (entry.writeReady == state) {
                    newQueue.push(entry)
                }
            } catch (error) {
                console.log(error)
            }

        }
        return newQueue
    }
    pushOperation(selector = 'unknown', path = '') {
        let htmlCaptureEntry = new HtmlCaptureEntry(selector, path)
        this.__queue.push(htmlCaptureEntry)
        return this.__queue.length - 1
    }
    popOperation(htmlPath) {
        let item = this.__queue.find(item => item.path == htmlPath)
        item.path = this.lastFilePath
        item.writeReady = true
    }
    /**
     * Mark file to specific status. True=>competed false=>capturing null=>queue
     * @param {string} fileName 
     * @param {boolean} status 
     */
    __markFileStatus(fileName, status) {
        for (let i = 0; i < this.__queue.length; i++) {
            let item = this.__queue[i]
            if (item.path == fileName) {
                this.__queue[i].writeReady = status
                break
            }
        }
    }
    markWriteReady(fileName) {
        this.__markFileStatus(fileName, true)
    }
    markWriteStarted(fileName) {
        this.__markFileStatus(fileName, false)
    }
    async outputHtml(newPath) {
        let timeStamp = Date.now()

        let htmlFound = false
        //get current html capture
        let i = this.__queue.length - 1;
        // if (i >= 0) {
        //     htmlFound = true
        // }

        for (i = this.__queue.length - 1; i >= 0; i--) {
            //find last element that is either in complete or capturing state
            if (this.__queue[i].writeReady != null) {
                htmlFound = true
                break
            }
        }

        //if no picture found, just return
        if (!htmlFound) {
            return
        }
        let writeComplete = false
        do {

            try {
                writeComplete = this.__queue[i].writeReady
                await new Promise(resolve => { setTimeout(resolve, 500) })
            } catch (error) {
                i = i - 1
            }
        } while (writeComplete == false)
        let filePath = this.__queue[i].path
        this.__queue[i].outputPath.push(newPath)

        try {
            await fs.copyFile(filePath, newPath)

            // await fs.unlink(filePath)
            // this.__queue[i].path = newPath
        } catch (error) {
            console.log(error)
        }

    }
}
module.exports = HtmlCaptureStatus