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
        this.__timestamp = Date.now()
    }

    /**
     * get last html capture before timestamp
     * @param {number} timestamp 
     * @returns {HtmlCaptureEntry}
     */
    getLastCaptureBeforeTimeStamp(timestamp) {
        /** @type {HtmlCaptureEntry} */
        let result = this.__queue[0]
        for (const item of this.__queue) {
            if (!item.writeReady) {
                continue
            }
            //if current item is taken before the target time stamp, it is okay, we will resume
            //otherwise, we will break the loop and return last item
            if ((item.timeStamp - timestamp) > 0)
                break

            result = item
        }
        return result
    }
    refreshTimeStamp() {
        this.__timestamp = Date.now()
    }
    get timestamp() {
        return this.__timestamp
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
    /**
     * Update html path to something new in case this html is the same as previous one
     * @param {number} stepIndex 
     * @param {string} newPath 
     */
    updateHtmlPath(stepIndex, newPath) {
        this.__queue[stepIndex].path = newPath
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
        this.refreshTimeStamp()
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
        } while (writeComplete != true)
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
    /**
     * Based on the html path, return the diff to the specific html path 
     * @param {string} html 
     * @param {number} offSet 
     */
    getHtmlByPath(html, offSet) {
        //get an rough estimate on where current html come from
        let currentIndex = this.__queue.findIndex(item => { return item.outputPath.includes(html) || item.path == html || item.path.includes(html.split('/').join('\\')) })
        if (currentIndex == -1) {
            throw 'Unable to find current html in the html repo'
        }

        let updatedIndex = currentIndex
        //find next/previous element that is different from current picture
        do {
            updatedIndex = updatedIndex + offSet


            //updated index reach maximum limit
            if (updatedIndex < 0) {
                updatedIndex = 0
                break
            }
            //updated index reach minimum limit
            if (updatedIndex >= this.__queue.length) {
                updatedIndex = this.__queue.length - 1
                break
            }

            //the element in the updated index is different from current picture
            let updatedHtml = this.__queue[updatedIndex]
            if (updatedHtml.path != html && !updatedHtml.outputPath.includes(html)) {
                break
            }

        }
        while (true)
        return this.__queue[updatedIndex].path
    }
}
module.exports = HtmlCaptureStatus