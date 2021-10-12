
let FunctionAst = require('../../ast/class/Function')
const { getVariableDeclaration, getCodeWrapper } = require('./AstGenerator')
let AstGenerator = require('./AstGenerator')
class Coder {
    /**
     * 
     * @param {Array<FunctionAst>} functionList 
     * @param {string} bluestoneLocatorPath the abosolute path of bluestone-locator.js
     * @param {string} bluestoneFuncPath the absolute path to bluestone-locator.js
     * @param {string} inbuiltFuncPath the absolute path to inbuilt bluestone-func.js
     * @param {string} configPath the absolute path to config.js
     * @param {string} testFilePath 
     */
    constructor(functionList, bluestoneLocatorPath, bluestoneFuncPath, configPath, testFilePath, inbuiltFuncPath) {
        this.funcList = functionList

        this.__testSuite = ''
        this.__testCase = ''
        this.__testFilePath = testFilePath
        this.__testCaseAst = this.getTestcaseBody()
        this.__astRequire = null
        this.inbuiltVarName = {
            require: [
                {
                    locator: bluestoneLocatorPath,
                    projectFunc: bluestoneFuncPath,
                    puppeteer: 'puppeteer-core',
                    bluestoneFunc: inbuiltFuncPath || '../../../ptLibrary/bluestone-func',
                    config: configPath
                },
            ],
            body: {
                variableDeclaration=['element', 'variable'],
                browserVarName: 'browser',
                pageVarName: 'page'
            }
        }
    }
    /**
     * Sample: const variableName=require('libraryName')
     * @param {string} variableName 
     * @param {string} libraryName 
     */
    __addRequireInfo(variableName, libraryName) {
        this.__astRequire.body.push(variableName, libraryName)
    }
    /**
     * Add all require info to the beginning of the main ast
     */
    getRequireInfo() {
        this.__astRequire = AstGenerator.getCodeWrapper()
        let keys = Object.keys(this.inbuiltVarName.require)
        keys.forEach(key => {
            this.__addRequireInfo(key, this.inbuiltVarName.require[key])
        })
        return this.__astRequire
    }
    get testcaseCodeBody() {
        return this.__testCaseAst.expression.arguments[1].body.body[0].expression.arguments[1].body.body
    }
    /**
     * Add following line to the beginning of the testcase
     * //let element,variable
     * //const browser = await puppeteer.launch(config.puppeteer)
     * //const page = await browser.newPage();
     */
    getTestcaseBody() {
        let ast
        let testcaseCodeBody = AstGenerator.getDescribeItWrapper(this.__testSuite, this.__testCase)

        //let element,variable
        ast = AstGenerator.getVariableDeclaration(this.inbuiltVarName.body.variableDeclaration)
        testcaseCodeBody.push(ast)
        //const browser = await puppeteer.launch(config.puppeteer)
        ast = AstGenerator.getBrowserArgAst(this.inbuiltVarName.body.browserVarName)
        testcaseCodeBody.push(ast)
        //const page = await browser.newPage();
        ast = AstGenerator.getPageInitializationStatement(this.inbuiltVarName.body.pageVarName, this.inbuiltVarName.body.browserVarName)
        testcaseCodeBody.push(ast)

        //follow

        return testcaseCodeBody
    }
    getTestcaseStep() {
        let ast = []
        for (let i = 0; i < this.funcList.length; i++) {
            let currentFunc = this.funcList[i]
            
        }
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