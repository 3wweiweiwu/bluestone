class MochaResult {
    /**
     * 
     * @param {boolean} isResultPass 
     * @param {string} resultNote 
     * @param {number} failedStep 
     */
    constructor(isResultPass, resultNote, failedStep = -1) {
        this.isResultPass = isResultPass
        this.resultNote = resultNote
        this.failedStep = failedStep
    }
}
module.exports = MochaResult
