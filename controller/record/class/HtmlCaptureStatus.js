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
    }
    popOperation() {
        this.__popIndex++
    }
    getLastItemBeforeTimeStamp() {
        let timeStamp = Date.now()
        let i = 0
        for (i = 0; i < this.__queue.length; i++) {
            if (this.__queue[i] > timeStamp) {
                break
            }
        }
        i = i - 1

        return this.__queue[i]
    }
}
module.exports = HtmlCaptureStatus