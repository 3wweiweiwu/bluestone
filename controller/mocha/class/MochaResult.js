class MochaResult {
    /**
     * 
     * @param {boolean} isResultPass 
     * @param {string} resultNote 
     * @param {number} failedStep 
     */
    constructor(isResultPass, resultNote, failedStep) {
        this.isResultPass = isResultPass
        this.resultNote = resultNote
        this.failedStep = -1
    }
}
module.exports = MochaResult
