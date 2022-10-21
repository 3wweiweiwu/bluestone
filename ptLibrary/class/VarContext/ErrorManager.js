class ErrorEntry {
    /**
     * 
     * @param {Error} err 
     * @param {string} title
     * @param {string} fullTitle
     * @param {string} retryCount
     */
    constructor(err, title, fullTitle, retryCount) {
        this.stack = err.stack
        this.message = err.message
        this.generatedMessage = err.generatedMessage
        this.name = err.name
        this.code = err.code
        this.title = title
        this.fullTitle = fullTitle
        this.retryCount = retryCount
    }
}
class ErrorMessage {
    constructor() {
        /**@type {ErrorEntry[]} */
        this.ErrorList = []
    }
    /**
     * 
     * @param {Error} err 
     * @param {string} title
     * @param {string} fullTitle
     */
    addInfo(err, title, fullTitle) {
        let retryCount = 0
        let historicalErrorList = this.ErrorList.filter(item => item.fullTitle == fullTitle)
        if (historicalErrorList && historicalErrorList.length > 0)
            retryCount = historicalErrorList.length

        let errorEntry = new ErrorEntry(err, title, fullTitle, retryCount)
        this.ErrorList.push(errorEntry)
    }
    parse(errObj) {
        this.ErrorList = errObj
    }
}
module.exports = ErrorMessage