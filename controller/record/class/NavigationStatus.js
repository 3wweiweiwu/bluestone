class Navigation {
    //navigation life cycle consist of 3 stages
    // 0   stage default - isPending=false, this means that there is no pending navigation, we just need to directly navigate right awawy
    // 1st stage initialize - isPending=false to true. This means that there is pending capture, we pause navigation and wait till all pending work is ready. Once all work is ready, we wil resume navigation
    // 2nd stage redirect - isPending from false to null- All pending work is ready. we start to re-navigation
    // 3rd stage complete - isPending from null to false - restore recording status and navigate to new page
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
    redirect() {
        this.isPending = null
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