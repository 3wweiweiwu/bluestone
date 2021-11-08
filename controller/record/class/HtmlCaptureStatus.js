const fs = require('fs').promises
const { constants } = require('fs')
class HtmlCaptureEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     */
    constructor(selector, path) {
        this.timeStamp = Date.now()
        this.selector = selector
        this.path = path
        this.writeReady = false
    }
}
class HtmlCaptureStatus {
    constructor() {
        /** @type {Array<HtmlCaptureEntry>} */
        this.__queue = []
        this.__popIndex = -1
    }
    get isHtmlCaptureOngoing() {
        if (this.__queue.length <= this.__popIndex + 1) {
            return false
        }
        else {
            return true
        }
    }
    getPendingItems() {
        return this.__queue.length - this.__popIndex - 1
    }
    pushOperation(selector = 'unknown', path = '') {
        let htmlCaptureEntry = new HtmlCaptureEntry(selector, path)
        this.__queue.push(htmlCaptureEntry)
        return this.__queue.length - 1
    }
    popOperation() {
        //set timeout to delete picture in next 1 minute


        if (this.__popIndex != -1) {
            let currentItem = this.__queue[this.__popIndex]
            setTimeout((currentPath) => {

                fs.unlink(currentPath)
                    .catch(err => { })


            }, 30000, currentItem.path);
        }



        this.__popIndex++
    }
    markWriteReady(index) {
        this.__queue[index].writeReady = true
    }
    async outputHtml(newPath) {
        let timeStamp = Date.now()
        let i = 0
        let htmlFound = false
        for (i = this.__queue.length - 1; i >= 0; i--) {
            if (this.__queue[i].writeReady) {
                htmlFound = true
                break
            }
        }

        //if no picture found, just return
        if (!htmlFound) {
            return
        }
        let filePath = this.__queue[i].path

        try {
            await fs.copyFile(filePath, newPath)
        } catch (error) {
            console.log(error)
        }

    }
}
module.exports = HtmlCaptureStatus