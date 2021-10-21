class HtmlCaptureStatus {
    constructor() {
        this.__queue = []
    }
    get isHtmlCaptureOngoing() {
        if (this.__queue.length != 0) {
            return true
        }
        else {
            return false
        }
    }
    pushOperation(selector = 'unknown') {
        this.__queue.push(selector)
    }
    popOPeration() {
        this.__queue.pop()
    }
}
module.exports = HtmlCaptureStatus