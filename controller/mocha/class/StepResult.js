class PuppeteerResult {
    constructor() {
        this.__isResultPass = false
        this.resultText = ''
    }
    get isResultPass() {
        return this.__isResultPass
    }
    set isResultPass(isPass) {
        this.__isResultPass = isPass
    }
}
module.exports = PuppeteerResult