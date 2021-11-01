const jimp = require('jimp')
const fs = require('fs').promises
class PicCaptureEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     */
    constructor(selector, path) {
        this.timeStamp = null
        this.selector = selector
        this.path = path
        this.isCaptureDone = false
        this.isLocked = false
    }
}
class PicCapture {
    constructor() {
        /** @type {Array<PicCaptureEntry>} */
        this.__queue = []
        this.__popIndex = -1
    }
    get isCaptureOngoing() {
        if (this.__queue.length == this.__popIndex + 1) {
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
        let htmlCaptureEntry = new PicCaptureEntry(selector, path)
        let length = this.__queue.push(htmlCaptureEntry)
        return length - 1
    }
    popOperation() {
        //set timeout to delete picture in next 1 minute

        if (this.__popIndex != -1) {
            let currentItem = this.__queue[this.__popIndex]
            this.__queue[this.__popIndex].timeStamp = Date.now()
            setTimeout((currentPath) => {

                fs.unlink(currentPath).catch(err => { })

            }, 120000, currentItem.path);
        }

        this.__popIndex++
    }
    markCaptureDone(index) {
        this.__queue[index].isCaptureDone = true
    }
    async outputCurrentPic(x, y, width, height, newPath) {
        let timeStamp = Date.now()
        let i = 0
        for (i = 0; i < this.__queue.length; i++) {
            if (this.__queue[i].timeStamp > timeStamp || this.__queue[i].timeStamp == null) {
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
            if (this.__queue[i].isCaptureDone) {
                break
            }
            await new Promise(resolve => { setTimeout(resolve, 500) })

        } while (true);
        //corp the picture to specific size
        let pic = null
        try {
            pic = await jimp.read(filePath)
        } catch (error) {
            console.log(error)
        }

        try {
            pic = pic.crop(x, y, width, height);
            pic.writeAsync(newPath)

        } catch (error) {
            console.log(error)
        }

    }
}
module.exports = PicCapture