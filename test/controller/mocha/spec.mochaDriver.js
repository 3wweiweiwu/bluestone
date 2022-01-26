
const MochaDriver = require('../../../controller/mocha/index')
const AstManager = require('../../../controller/ast/index')
const { LocatorManager } = require('../../../controller/locator/index')
const path = require('path')
const assert = require('assert')
const Mocha = require('mocha')
describe('mocha driver', () => {
    it('should run test', async () => {
        let filePath = path.join(__dirname, '../../sample-project/script/spec.sdf1.js')
        let mocha = new MochaDriver(filePath, 99999)
        let s1 = await mocha.runScript()
        console.log(s1)
    }).timeout(999999)
    it('should return error info correctly', (done) => {
        let mo = new Mocha()
        let filePath = (path.join(__dirname, '../../sample-project/script/spec.sdf1.js'))
        // let runner = mo.addFile("C:\\Users\\3wwei\\bluestone\\test\\sample-project\\script\\spec.sdf1.js")
        let runner = mo.addFile(filePath.toUpperCase())

        runner.run(function (failures) {
            process.exitCode = failures ? 1 : 0;  // exit with non-zero status if there were failures
        })
            .on('fail', (test, err) => {
                done()
            })
            .on('pass', test => {
                done()
            })


    }).timeout(60000)
    it('should abort test run successfully')
})