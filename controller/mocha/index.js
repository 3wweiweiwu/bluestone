let Mocha = require('mocha')
let MochaResult = require('./class/MochaResult')
let TestcaseLoader = require('../ast/TestCaseLoader')
const AstManager = require('../ast/index')
const { LocatorManager } = require('../locator/index')
class MochaDriver {
    /**@type {TestcaseLoader} */
    #testcase
    /**@type {Mocha.Runner} */
    #runner
    /**
     * 
     * @param {string} filePath 
     * @param {LocatorManager} locatorManager 
     * @param {AstManager} astManager 
     * @param {number} timeout 
     */
    constructor(filePath, locatorManager, astManager, timeout = 999999) {
        this.__mocha = new Mocha({ timeout: timeout })
        this.__filePath = filePath.toUpperCase()
        this.__state = null
        this.__result = new MochaResult(false, '')
        this.#testcase = new TestcaseLoader(filePath, locatorManager, astManager)
        this.#runner = null
    }
    static ConstVar = {
        runningState: {
            NOT_START: 'NOT_START',
            RUNNING: 'RUNNING',
            PASS: 'PASS',
            FAIL: 'FAIL',
            ABORTED: 'ABORTED'
        }
    }
    /**
     * 
     * @returns {MochaResult}
     */
    async runScript() {
        return new Promise((resolve) => {
            let runner = this.__mocha.addFile(this.__filePath).grep("^test1 sdf1$").run()
            runner
                .on('start', () => {
                    this.__state = MochaDriver.ConstVar.runningState.RUNNING
                })
                .on('fail', async (test, err) => {
                    await this.#testcase.parseTc()
                    this.__state = MochaDriver.ConstVar.runningState.FAIL

                    let stepIndex = this.#getErrorStepIndexByLine(this.__filePath, err.stack)
                    this.__result = new MochaResult(false, err.toString(), stepIndex)

                    return resolve(this.__result)
                })
                .on('pass', test => {
                    this.__state = MochaDriver.ConstVar.runningState.PASS
                    this.__result = new MochaResult(true, '')
                    return resolve(this.__result)
                })
                .on('end', test => {
                    if (this.__state == MochaDriver.ConstVar.runningState.RUNNING) {
                        this.__result = new MochaResult(false, 'Script is aborted by user', -1)
                        return resolve(this.__result)
                    }
                })
            this.#runner = runner
        })
    }
    get result() {
        return this.__result
    }
    abortScript() {
        this.#runner.abort()
    }
    #getErrorStepIndexByLine(filePath, errorStack) {
        let stepIndex = -1
        let errorLine = errorStack.split('\n').find(item => item.includes(this.__filePath + ":"))
        if (errorLine == null)
            return stepIndex
        let errorContext = errorLine.replace(this.__filePath, '')
        let lineStr = errorContext.split(':')[1]

        //get line number
        let lineNumber
        try {
            lineNumber = Number.parseInt(lineStr)
        } catch (error) {
            return stepIndex
        }

        //based on line number identify which step are we in
        stepIndex = this.#testcase.steps.findIndex(item => item.scriptLineNumber == lineNumber)
        return stepIndex
    }

}

module.exports = MochaDriver