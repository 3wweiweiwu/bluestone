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
    }
}
class HtmlCaptureStatus {
    constructor() {
        /** @type {Array<HtmlCaptureEntry>} */
        this.__queue = []
        this.__popIndex = -1
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
                if (entry.writeReady != true) {
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
    popOperation(fileName) {
        this.__queue = this.__queue.filter(item => {
            return item.path != fileName
        })
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
        while (!this.__queue[i].writeReady) {
            await new Promise(resolve => { setTimeout(resolve, 500) })
        }
        let filePath = this.__queue[i].path

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