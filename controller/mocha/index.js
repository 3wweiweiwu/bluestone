let Mocha = require('mocha')
let MochaResult = require('./class/MochaResult')
class MochaDriver {
    constructor(filePath, timeout = 999999) {
        this.__mocha = new Mocha({ timeout: timeout })
        this.__filePath = filePath
        this.__state = null
        this.__result = new MochaResult(false, '')
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
    async runScript() {
        return new Promise((resolve, reject) => {
            let runner = mocha.addFile(this.__filePath).run()
            runner
                .on('start', () => {
                    this.__state = MochaDriver.ConstVar.runningState.RUNNING
                })
                .on('fail', (test, err) => {
                    this.__state = MochaDriver.ConstVar.runningState.FAIL
                    this.__result = new MochaResult(false, err.toString())
                    return reject(this.__result)
                })
                .on('pass', test => {
                    this.__state = MochaDriver.ConstVar.runningState.PASS
                    this.__result = new MochaResult(true, '')
                    return resolve(this.__result)

                })
        })
    }

}