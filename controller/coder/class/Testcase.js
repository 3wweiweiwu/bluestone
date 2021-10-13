
let FunctionAst = require('../../ast/class/Function')
const { getVariableDeclaration, getCodeWrapper } = require('./AstGenerator')
let AstGenerator = require('./AstGenerator')
const escodegen = require('escodegen')
const fs = require("fs").promises
const path = require('path')
class Coder {
    /**
     * 
     * @param {Array<FunctionAst>} functionList 
     * @param {string} projectLocatorPath the abosolute path of bluestone-locator.js for project
     * @param {string} projectFuncPath the absolute path to bluestone-func.js for project
     * @param {string} inbuiltFuncPath the absolute path to inbuilt bluestone-func.js
     * @param {string} configPath the absolute path to config.js
     * @param {string} testFileFolder 
     */
    constructor(functionList, projectLocatorPath, projectFuncPath, configPath, testFileFolder, inbuiltFuncPath) {
        this.funcList = functionList

        this.__testSuite = ''
        this.__testCase = ''
        this.__testFileFolder = testFileFolder
        this.__testCaseAst = AstGenerator.getDescribeItWrapper(this.__testSuite, this.__testCase)
        this.__ast = AstGenerator.getCodeWrapper()
        this.inbuiltVarName = {
            require: {},
            library: {
                locatorLibrary: 'locator',
                projectFuncLibrary: 'projectFunc',
                puppeteerLibrary: 'puppeteer',
                bluestoneFuncLibrary: 'bluestoneFunc',
                configLibrary: 'config'
            },
            body: {
                variableDeclaration: ['element', 'variable'],
                browserVarName: 'browser',
                pageVarName: 'page'
            }
        }


        this.inbuiltVarName.require = {

            [this.inbuiltVarName.library.locatorLibrary]: path.resolve(projectLocatorPath),
            [this.inbuiltVarName.library.projectFuncLibrary]: path.resolve(projectFuncPath),
            [this.inbuiltVarName.library.puppeteerLibrary]: 'puppeteer-core',
            [this.inbuiltVarName.library.bluestoneFuncLibrary]: path.resolve(inbuiltFuncPath),
            [this.inbuiltVarName.library.configLibrary]: configPath

        }
    }
    get fileName() {
        return this.testCase.replace(/\W/g, '_') + '.js'

    }
    /**
     * Sample: const variableName=require('libraryName')
     * @param {string} variableName 
     * @param {string} libraryName 
     */
    __addRequireInfo(variableName, libraryName) {
        let require = AstGenerator.getRequireStatement(variableName, libraryName)
        this.__ast.body.push(require)
    }
    /**
     * Add all require info to the beginning of the main ast
     */
    __updateAstRequirement() {
        this.__ast = AstGenerator.getCodeWrapper()
        let keys = Object.keys(this.inbuiltVarName.require)
        keys.forEach(key => {
            let linuxPath = path.relative(this.__testFileFolder, this.inbuiltVarName.require[key]).replace(/\\/g, '/')
            this.__addRequireInfo(key, linuxPath)
        })
        return this.__ast
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
    __updateTestcaseBodyAst() {
        let ast
        this.__testCaseAst = AstGenerator.getDescribeItWrapper(this.__testSuite, this.__testCase)

        //let element,variable
        ast = AstGenerator.getVariableDeclaration(this.inbuiltVarName.body.variableDeclaration)
        this.testcaseCodeBody.push(ast)
        //const browser = await puppeteer.launch(config.puppeteer)
        ast = AstGenerator.getBrowserStatement(this.inbuiltVarName.body.browserVarName, this.inbuiltVarName.library.puppeteerLibrary, this.inbuiltVarName.library.configLibrary, 'puppeteer')
        this.testcaseCodeBody.push(ast)
        //const page = await browser.newPage();
        ast = AstGenerator.getPageInitializationStatement(this.inbuiltVarName.body.pageVarName, this.inbuiltVarName.body.browserVarName)
        this.testcaseCodeBody.push(ast)

        //create follow-up step
        let stepList = this.__getTestcaseStep()
        stepList.forEach(item => {
            this.testcaseCodeBody.push(item)
        })
    }
    __getTestcaseStep() {
        let ast = []
        for (let i = 0; i < this.funcList.length; i++) {
            let currentFunc = this.funcList[i]
            let currentCommandAst = this.__generateAstForCommand(currentFunc)
            ast.push(currentCommandAst)
        }
        return ast
    }
    /**
     * Generate final ast and output it into the disk
     */
    async __generateFinalAst() {
        this.__updateAstRequirement()

        this.__updateTestcaseBodyAst()
        //combine astRequirement with astTestcaseBody
        this.__ast.body = this.__ast.body.concat(this.__testCaseAst)

        //output file
        return this.__ast
    }
    async writeCodeToDisk() {
        await this.__generateFinalAst()
        let outputPath = path.join(this.__testFileFolder, this.fileName)
        let testCode = escodegen.generate(this.__ast)
        await fs.writeFile(outputPath, testCode)
        return outputPath
    }

    /**
     * 
     * @param {FunctionAst} functionAst 
     * @returns 
     */
    __generateAstForCommand(functionAst) {

        //decide library name
        let currentFuncPath = path.resolve(functionAst.path)
        let bluestoneFuncPath = this.inbuiltVarName.require[this.inbuiltVarName.library.bluestoneFuncLibrary]
        let libraryName = this.inbuiltVarName.library.projectFuncLibrary
        if (currentFuncPath == bluestoneFuncPath) {
            libraryName = this.inbuiltVarName.library.bluestoneFuncLibrary
        }
        let astJson = AstGenerator.getAwaitCommandWrapper(libraryName, functionAst.name)
        for (let i = 0; i < functionAst.params.length; i++) {
            let param = functionAst.params[i]
            //construct scope
            switch (param.type.name) {
                case "Page":
                    let pageVarAst = AstGenerator.getPageArgAst(this.inbuiltVarName.body.pageVarName)
                    astJson.expression.argument.arguments.push(pageVarAst)
                    break;
                case "Browser":
                    let browserVarAst = AstGenerator.getBrowserArgAst(this.inbuiltVarName.body.browserVarName)
                    astJson.expression.argument.arguments.push(browserVarAst)
                    break;
                case "ElementSelector":
                    let elementVarAst = AstGenerator.getElementSelectorArgAst(this.inbuiltVarName.library.locatorLibrary, param.value)
                    astJson.expression.argument.arguments.push(elementVarAst)
                    break;
                case "string":
                    let strVarAst = AstGenerator.getSimpleValue(param.value)
                    astJson.expression.argument.arguments.push(strVarAst)
                    break;
                case "number":
                    let numberVarAst = AstGenerator.getSimpleValue(param.value)
                    astJson.expression.argument.arguments.push(numberVarAst)
                    break
                default:
                    break;
            }
        }
        return astJson

    }
    get testSuite() {
        return this.__testSuite
    }
    set testSuite(name) {
        this.__testSuite = name
    }
    get testCase() {
        return this.__testCase
    }
    set testCase(name) {
        this.__testCase = name
    }

}

module.exports = Coder