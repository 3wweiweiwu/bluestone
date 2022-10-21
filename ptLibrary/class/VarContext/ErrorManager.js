class ErrorEntry {
    /**
     * 
     * @param {Error} err 
     * @param {string} title
     * @param {string} fullTitle
     * @param {string} retryCount
     * @param {string} file
     */
    constructor(err, title, fullTitle, retryCount, file) {
        this.stack = err.stack
        this.message = err.message
        this.generatedMessage = err.generatedMessage
        this.name = err.name
        this.code = err.code
        this.title = title
        this.fullTitle = fullTitle
        this.retryCount = retryCount
        this.file = file
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
     * @param {string} file
     */
    addInfo(err, title, fullTitle, file) {
        let retryCount = 0
        let historicalErrorList = this.ErrorList.filter(item => item.fullTitle == fullTitle)
        if (historicalErrorList && historicalErrorList.length > 0)
            retryCount = historicalErrorList.length

        let errorEntry = new ErrorEntry(err, title, fullTitle, retryCount, file)
        this.ErrorList.push(errorEntry)
    }
    parse(errObj) {
        this.ErrorList = errObj
    }
}
module.exports = ErrorMessage