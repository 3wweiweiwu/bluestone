const jimp = require('jimp')
const fs = require('fs').promises
class PicCaptureEntry {
    /**
     * 
     * @param {string} selector 
     * @param {string} path full path to captured file
     */
    constructor(selector, path) {
        this.timeStamp = Date.now()
        this.selector = selector
        this.path = path
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
    pushOperation(selector = 'unknown', path = '') {
        let htmlCaptureEntry = new PicCaptureEntry(selector, path)
        this.__queue.push(htmlCaptureEntry)
    }
    popOperation() {
        this.__popIndex++
    }
    async outputCurrentPic(x, y, width, height, newPath) {
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
        let isFileReady = false
        do {
            try {
                await fs.access(filePath)
                break
            } catch (error) {
                await new Promise(resolve => { setTimeout(resolve, 500) })
            }
        } while (true);
        //corp the picture to specific size
        let pic = await jimp.read(filePath)
        pic = pic.crop(x, y, width, height);
        pic.writeAsync(newPath)

    }
}
module.exports = PicCapture