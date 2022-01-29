let Mocha = require('mocha')
let MochaResult = require('./class/MochaResult')
let TestcaseLoader = require('../ast/TestCaseLoader')
const AstManager = require('../ast/index')
const { LocatorManager } = require('../locator/index')
const path = require('path')
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
        this.__mocha = new Mocha({ timeout: timeout, fullTrace: true })
        this.__mocha.suite.on('require', function (global, file) {
            if (require.cache[file]) {
                delete require.cache[file];
            }
            else {
                require(file)
            }


        });
        this.__filePath = filePath
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
        return new Promise(async (resolve) => {
            this.__mocha.addFile(this.__filePath)
            // this.__mocha.cleanReferencesAfterRun(false)
            await this.__mocha.loadFilesAsync()

            this.#runner = this.__mocha.run(() => {
                this.__mocha.dispose()
            })
            this.#runner
                .on('start', () => {
                    this.__state = MochaDriver.ConstVar.runningState.RUNNING
                })
                .on('fail', async (test, err) => {
                    this.__state = MochaDriver.ConstVar.runningState.FAIL
                    await this.#testcase.parseTc()
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
                        this.__result = new MochaResult(false, 'Abnormal Error', -1)
                        return resolve(this.__result)
                    }
                })
                .on('dispose', () => {
                    if (this.__state == MochaDriver.ConstVar.runningState.RUNNING) {
                        this.__result = new MochaResult(false, 'Execution is aborted by user', -1)
                        return resolve(this.__result)
                    }
                    this.#runner.dispose()

                })
        })
    }
    get result() {
        return this.__result
    }
    abortScript() {
        this.#runner.emit('dispose')
    }
    #getErrorStepIndexByLine = function (filePath, errorStack) {
        let stepIndex = -1
        let fileName = path.basename(filePath)
        let errorLine = errorStack.split('\n').find(item => item.includes(fileName + ":"))
        if (errorLine == null)
            return stepIndex
        let errorContext = errorLine.replace(filePath, '')
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