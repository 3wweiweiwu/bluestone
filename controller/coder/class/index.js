
let Function = require('../../ast/class/Function')
const { getVariableDeclaration } = require('./AstGenerator')
let AstGenerator = require('./AstGenerator')
class Coder {

    constructor(functionList) {
        this.funcList = functionList

        this.__testSuite = ''
        this.__testCase = ''
        this.__ast = AstGenerator.getCodeWrapper()

        this.__testCaseAst = AstGenerator.getDescribeItWrapper(this.__testSuite, this.__testCase)
        this.__testCaseAst = this.initializeTestcaseBody()
    }
    /**
     * Sample: const variableName=require('libraryName')
     * @param {string} variableName 
     * @param {string} libraryName 
     */
    addRequireInfo(variableName, libraryName) {
        this.__ast.body.push(variableName, libraryName)
    }
    get testcaseCodeBody() {
        return this.__testCaseAst.expression.arguments[1].body.body[0].expression.arguments[1].body.body
    }
    static inbuiltVarName = {
        body: {
            variableDeclaration=['element', 'variable'],
            browserVarName: 'browser',
            pageVarName: 'page'
        }
    }
    /**
     * Add following line to the beginning of the testcase
     * //let element,variable
     * //const browser = await puppeteer.launch(config.puppeteer)
     * //const page = await browser.newPage();
     */
    initializeTestcaseBody() {
        let ast
        //let element,variable
        ast = AstGenerator.getVariableDeclaration(Coder.inbuiltVarName.body.variableDeclaration)
        this.testcaseCodeBody.push(ast)
        //const browser = await puppeteer.launch(config.puppeteer)
        ast = AstGenerator.getBrowserArgAst(Coder.inbuiltVarName.body.browserVarName)
        this.testcaseCodeBody.push(ast)
        //const page = await browser.newPage();
        ast = AstGenerator.getPageInitializationStatement(Coder.inbuiltVarName.body.pageVarName, Coder.inbuiltVarName.body.browserVarName)
    }

    /**
     * const page = await browser.newPage();
     * @param {string} pageVarName page
     * @param {string} browserVarName browser
     * @returns 
     */
    static getPageInitializationStatement(pageVarName, browserVarName) {
        let ast = AstGenerator.getPageInitializationStatement(pageVarName, browserVarName)
        return ast
    }
    get testSuite() {
        return this.__testSuite
    }
    set testSuite(name) {
        this.__testCaseAst.expression.arguments[0].value = name
        this.__testSuite = name
    }
    get testCase() {
        return this.__testCase
    }
    set testCase(name) {
        this.__testCaseAst.expression.arguments[0].body.body[0].expression.arguments[0].value = name
        this.__testCase = name
    }

}