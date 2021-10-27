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
        if (this.__queue.length == this.__popIndex + 1) {
            return false
        }
        else {
            return true
        }
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
                try {
                    fs.unlink(currentPath)
                } catch (error) {

                }

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
        for (i = 0; i < this.__queue.length; i++) {
            if (this.__queue[i] > timeStamp) {
                break
            }
        }
        i = i - 1
        //if no picture found, just return
        if (i == -1) {
            return
        }
        let filePath = this.__queue[i].path
        //keep waiting until picture is ready
        do {
            if (this.__queue[i].writeReady) {
                break
            }
            await new Promise(resolve => { setTimeout(resolve, 500) })

        } while (true);
        try {
            await fs.copyFile(filePath, newPath)
        } catch (error) {
            console.log(error)
        }

    }
}
module.exports = HtmlCaptureStatus