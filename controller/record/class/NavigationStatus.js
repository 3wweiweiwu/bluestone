class Navigation {
    constructor() {
        this.__isPending = false
        this.__url = ''
        this.__method = ''
        this.__postData = ''
        this.__headers = {}
    }
    initialize(url, method, postData, headers, isRecording) {
        this.isRecording = isRecording
        this.isPending = true
        this.method = method
        this.postData = postData
        this.url = url
        this.__headers = JSON.parse(JSON.stringify(headers))
    }
    complete() {
        this.isPending = false
    }
    getCurrentNavigationData() {
        return {
            'method': this.method,
            'postData': this.postData,
            'headers': this.__headers

        }
    }
    get isPending() {
        return this.__isPending
    }
    set isPending(isPending) {
        this.__isPending = isPending
    }
    get url() {
        return this.__url
    }
    set url(url) {
        this.__url = url
    }
    get method() {
        return this.__method
    }
    set method(method) {
        this.__method = method
    }
    get postData() {
        return this.__postData
    }
    set postData(data) {
        this.__postData = data
    }
}

module.exports = Navigation