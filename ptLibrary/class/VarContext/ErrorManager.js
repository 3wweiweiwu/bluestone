class ErrorEntry {
    /**
     * 
     * @param {Error} err 
     */
    constructor(err) {
        this.stack = err.stack
        this.message = err.message
        this.generatedMessage = err.generatedMessage
        this.name = err.name
        this.code = err.code
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
     */
    addInfo(err) {
        let errorEntry = new ErrorEntry(err)
        this.ErrorList.push(errorEntry)
    }
    parse(errObj) {
        this.ErrorList = errObj
    }
}
module.exports = ErrorMessage