
const TestCaseLoader = require('../../../controller/ast/TestCaseLoader')
const AstManager = require('../../../controller/ast/index')
const { LocatorManager } = require('../../../controller/locator/index')
const path = require('path')
const assert = require('assert')
describe('Test Case Loader', () => {
    it("should load test case information correctly", async () => {
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let funcPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        let astManager = new AstManager(locatorPath, funcPath)
        await astManager.loadFunctions(funcPath)
        let locatorManager = new LocatorManager(locatorPath)


        let filePath = path.join(__dirname, './data/click_header.js')
        let testcase = new TestCaseLoader(filePath, locatorManager, astManager)
        await testcase.parseTc()

        //verify command
        let commandBaseline = ['goto', 'waitElementExists', 'click']
        let currentCommand = testcase.steps.map(item => item.command)
        assert.deepEqual(currentCommand, commandBaseline)
        //verify script line info
        let currentCommandLineIndexes = testcase.steps.map(item => item.scriptLineNumber)
        let baselineCommandLineIndexes = [11, 12, 13]
        assert.deepEqual(currentCommandLineIndexes, baselineCommandLineIndexes)
    }).timeout(60000)
})