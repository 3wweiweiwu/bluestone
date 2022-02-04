const AstGenerator = require('../../../controller/coder/class/AstGenerator')
const escodegen = require('escodegen')
const assert = require('assert')
describe('AST Generator Class', () => {
    it('should generate simple varable declaration ast', async () => {
        let ast = AstGenerator.getSimpleVariableAst('var1')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, 'var1')
        console.log()
    })

    it('should generate simple dictionary ast with dictionary', async () => {
        let ast = AstGenerator.getDictionaryVariableAst('var1', 'key1')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, "var1['key1']")
        console.log('ehllo world')
    })
    it('should generate simple value such as func(5)', async () => {
        let ast = AstGenerator.getSimpleValue(5)
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, 5)
        console.log('ehllo world')
    })
    it('should generate simple value such as func("something")', async () => {
        let ast = AstGenerator.getSimpleValue("something")
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, "'something'")
    })
    it('should generate simple value such as await func1.s1.func', async () => {
        let ast = AstGenerator.getAwaitCommandWrapper("func1", 's1')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, "await func1.s1.func();")
    })
    it('should generate const variableName=require(libraryName)', async () => {
        let ast = AstGenerator.getRequireStatement("variableName", 'libraryName')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, "const variableName = require('libraryName');")
    })
    it('should generate let s1,s2', async () => {
        let ast = AstGenerator.getVariableDeclaration(['s1', 's2'])
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, "let s1, s2;")
    })
    it('should generate test suite and test plan', async () => {
        let ast = AstGenerator.getDescribeItWrapper('test suite 1', 'testcase1')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, `describe('test suite 1', () => {\n    it('testcase1', async () => {\n    });\n});`)
    })
    it('should generate browser statement', async () => {
        let ast = AstGenerator.getBrowserStatement('browser', 'puppeteer', 'config', 'puppeteer')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, `const browser = await puppeteer.launch(config.puppeteer);`)
    })
    it('should generate clear browser cache command', async () => {
        let ast = AstGenerator.getSendBDPClientCommand('client', 'Network.clearBrowserCache')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, `await client.send('Network.clearBrowserCache');`)
    })
    it('should assign function result to a variable', async () => {
        let ast = AstGenerator.getAwaitCommandWrapper('lib', 'run')
        ast = AstGenerator.getAssignOperation('var1', ast)
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, 'var1 = await lib.run.func();')
    })
    it('should initialize vars correctly', async () => {
        let ast = AstGenerator.getVarSaverDeclaration()
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, 'vars = new bluestoneType.VarSaver(__filename);')
    })
    it('should call initialize function correctly', async () => {
        let ast = AstGenerator.getInitializeOperation('vars', 'page')
        let jsCode = escodegen.generate(ast)
        assert.equal(jsCode, 'await bluestoneFunc.initialize.func(vars, page);')
    })
})