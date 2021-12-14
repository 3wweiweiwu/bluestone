const fs = require('fs').promises
const { constants } = require('fs')
const path = require('path')
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
        return this.getPendingItemBeforeIndex()
    }
    /**
     * Get pending item before specific index
     * @param {number} index 
     * @returns {Array<HtmlCaptureEntry>}
     */
    getPendingItemBeforeIndex(index = null) {
        let waitingWorker = this.getWorkerAtState(null, index)
        let workingWorker = this.getWorkerAtState(false, index)
        let totalWorker = workingWorker.concat(waitingWorker)
        return totalWorker
    }
    /**
     * returns worker before filename that is in a particular state
     * @param {boolean} state 
     * @param {number} workerIndex 
     * @param {Array<HtmlCaptureEntry>} queue 
     * @returns {Array<HtmlCaptureEntry>}
     */
    getWorkerAtState(state, workerIndex = null) {
        //if worker index is null, we will go through all queue to find worker at particular state
        if (workerIndex == null) {
            workerIndex = this.__queue.length
        }
        let queue = this.__queue
        let newQueue = []
        for (let i = 0; i < workerIndex; i++) {
            let entry = queue[i]
            //if we find current file name, just stop
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
    popOperation(htmlIndex) {
        this.__queue[htmlIndex].path = this.lastFilePath
        this.__queue[htmlIndex].writeReady = true
    }
    /**
     * Mark file to specific status. True=>competed false=>capturing null=>queue
     * @param {number} workerIndex 
     * @param {boolean} status 
     */
    __markFileStatus(workerIndex, status) {
        this.__queue[workerIndex].writeReady = status
    }
    markWriteDone(workerIndex) {
        this.__markFileStatus(workerIndex, true)
    }
    /**
     * Mark worker at particular index to specific state. If current file's name is duplicate with other item in the queue, we will rename current item in order to resolve file clash
     * @param {number} workerIndex 
     * @returns {string} return the name of the current file
     */
    markWriteStarted(workerIndex) {
        //check if current worker's file name is unique
        let workerFilePath = this.__queue[workerIndex].path
        let totalFileWithSimilarName = this.__queue.filter(item => { return workerFilePath == item.path })
        if (totalFileWithSimilarName.length > 1) {
            let fileFolder = path.dirname(workerFilePath)
            let fileName = Date.now().toString() + ".html"
            this.__queue[workerIndex].path = path.join(fileFolder, fileName)
        }
        this.__markFileStatus(workerIndex, false)
        return this.__queue[workerIndex].path
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