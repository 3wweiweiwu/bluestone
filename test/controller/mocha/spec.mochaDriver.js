
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
        assert.strictEqual(s1.isResultPass, true)
        assert.strictEqual(s1.failedStep, -1)
    }).timeout(999999)
    it('should return error info correctly', async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let funcPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        let astManager = new AstManager(locatorPath, funcPath)
        await astManager.loadFunctions(funcPath)
        let locatorManager = new LocatorManager(locatorPath)


        let filePath = path.join(__dirname, '../../sample-project/script/spec.sdf1_fail.js')
        let mocha = new MochaDriver(filePath, locatorManager, astManager, 99999)
        let s1 = await mocha.runScript()
        assert.strictEqual(s1.isResultPass, false)
        assert.strictEqual(s1.failedStep, 2)

    }).timeout(60000)
    it('should abort test run successfully')
})