const AST = require('../../../controller/ast')
const path = require('path')
const fs = require('fs')
const acorn = require("acorn");
const assert = require('assert');
describe('AST class', () => {
    it('should get require inforamtion correctly', async () => {
        let funcPath = path.join(__dirname, '../../sample-project/bluestone-func.js')
        let locatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let astSummary = new AST(locatorPath, funcPath)
        let jsStr = fs.readFileSync(funcPath).toString()
        let ast = acorn.parse(jsStr)
        let jsDocSummary = await astSummary.__getRequireInfo(ast)
        assert.deepEqual(jsDocSummary.repo.length, 2)
    })
})