
let FunctionAst = require('../../ast/class/Function')
const { getVariableDeclaration, getCodeWrapper } = require('./AstGenerator')
let AstGenerator = require('./AstGenerator')
const escodegen = require('escodegen')
const fs = require("fs").promises
const path = require('path')
const preProsessAst = require('./preProsessAst')
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
            library: Coder.ConstVar.library,
            body: {
                variableDeclaration: ['element', 'vars', 'frame', 'variable'],
                browserVarName: 'browser',
                pageVarName: 'page',
                frameVarName: 'frame',
                varsVarName: 'vars',
                VariableStorageVarName: 'variable'
            },
            variableIndicator: 'vars:'
        }


        this.inbuiltVarName.require = {

            [this.inbuiltVarName.library.locatorLibrary]: path.resolve(projectLocatorPath),
            [this.inbuiltVarName.library.projectFuncLibrary]: path.resolve(projectFuncPath),
            [this.inbuiltVarName.library.puppeteerLibrary]: 'puppeteer',
            [this.inbuiltVarName.library.bluestoneFuncLibrary]: 'bluestone/ptLibrary/bluestone-func',
            [this.inbuiltVarName.library.configLibrary]: configPath,
            [this.inbuiltVarName.library.bluestoneType]: 'bluestone/ptLibrary/class/index'

        }
    }
    static ConstVar = {
        library: {
            locatorLibrary: 'locator',
            projectFuncLibrary: 'projectFunc',
            puppeteerLibrary: 'puppeteer',
            bluestoneFuncLibrary: 'bluestoneFunc',
            configLibrary: 'config',
            varSaver: 'vars',
            bluestoneType: 'bluestoneType'
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
            let linuxPath = this.inbuiltVarName.require[key]

            //skip bluestoneFunc as it contains /
            switch (linuxPath) {
                case this.inbuiltVarName.require[this.inbuiltVarName.library.bluestoneFuncLibrary]:
                    //this is a special case use bluestone's inbuilt library /
                    break;
                case this.inbuiltVarName.require[this.inbuiltVarName.library.bluestoneType]:
                    //this is a special case that contains /
                    break;
                default:
                    //check if it is a node_module. For node module, I assume it should never inlucde / \ .
                    if (linuxPath.includes('/') || linuxPath.includes('\\') || linuxPath.includes('.')) {
                        linuxPath = path.relative(this.__testFileFolder, linuxPath).replace(/\\/g, '/')
                    }
                    break;
            }


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

        //let element, vars, frame, variable
        ast = AstGenerator.getVariableDeclaration(this.inbuiltVarName.body.variableDeclaration)
        this.testcaseCodeBody.push(ast)
        // variable = {}
        ast = AstGenerator.getSingleVariableInitialization()
        this.testcaseCodeBody.push(ast)

        //const browser = await bluestoneFunc.launchBrowser.func(config.puppeteer)
        ast = AstGenerator.getBrowserStatementWithBluestone(this.inbuiltVarName.body.browserVarName, this.inbuiltVarName.library.configLibrary, 'puppeteer')
        this.testcaseCodeBody.push(ast)
        //const page = await browser.newPage();
        ast = AstGenerator.getPageInitializationStatement(this.inbuiltVarName.body.pageVarName, this.inbuiltVarName.body.browserVarName)
        this.testcaseCodeBody.push(ast)

        //let vars = { currentFileName: __filename };
        ast = AstGenerator.getVarSaverDeclaration()
        this.testcaseCodeBody.push(ast)

        //frame = page
        ast = AstGenerator.getAssignVarToVarOpeartion(this.inbuiltVarName.body.frameVarName, this.inbuiltVarName.body.pageVarName)
        this.testcaseCodeBody.push(ast)

        //await bluestoneFunc.initialize.func(vars, page)
        ast = AstGenerator.getInitializeOperation(this.inbuiltVarName.body.varsVarName, this.inbuiltVarName.body.pageVarName)
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
        this.funcList = await preProsessAst(this.funcList, this.testSuite, this.testCase)
        await this.__generateFinalAst()
        let outputPath = path.join(this.__testFileFolder, this.fileName)
        let testCode = escodegen.generate(this.__ast)
        await fs.writeFile(outputPath, testCode)
        return outputPath
    }
    /**
     * update function ast based on rule in order to output script correctly
     * @param {FunctionAST[]} astList 
     */
    async updateFunctionAstList(astList) {
        let ruleList = {}
        for (const ast of astList) {
            let currentRule = ruleList[ast.name]
            if (currentRule == null) continue
            await currentRule()
        }
        return astList
    }

    /**
     * 
     * @param {FunctionAst} functionAst 
     * @returns 
     */
    __generateAstForCommand(functionAst) {

        //decide library name
        let currentFuncPath = path.resolve(functionAst.path)
        let projectFuncPath = this.inbuiltVarName.require[this.inbuiltVarName.library.projectFuncLibrary]
        let libraryName = this.inbuiltVarName.library.projectFuncLibrary
        if (currentFuncPath != projectFuncPath) {
            libraryName = this.inbuiltVarName.library.bluestoneFuncLibrary
        }
        let astJson = AstGenerator.getAwaitCommandWrapper(libraryName, functionAst.name)
        for (let i = 0; i < functionAst.params.length; i++) {
            let param = functionAst.params[i]
            //if current value match variable pattern, we will treat it as variable
            // in this case, we will just push in variable and skip switch
            if (param.value && param.value.toString().toLowerCase().includes(this.inbuiltVarName.variableIndicator)) {
                let identifierName = param.value.split(this.inbuiltVarName.variableIndicator)[1]
                let memberExpressionAst = AstGenerator.getSimpleMemberExpression(this.inbuiltVarName.body.VariableStorageVarName, identifierName)
                astJson.expression.argument.arguments.push(memberExpressionAst)
                continue
            }
            //construct scope
            switch (param.type.name) {
                case "Frame":
                    let frameVarAst = AstGenerator.getFrameArgAst(this.inbuiltVarName.body.frameVarName)
                    astJson.expression.argument.arguments.push(frameVarAst)
                    break
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
                case "VarSaver":
                    let varSaverVarAst = AstGenerator.getVarSaverArgAst(this.inbuiltVarName.library.varSaver, param.value)
                    astJson.expression.argument.arguments.push(varSaverVarAst)
                    break;
                case "string":
                    let strVarAst = AstGenerator.getSimpleValue(param.value)
                    astJson.expression.argument.arguments.push(strVarAst)
                    break;
                case "number":
                    let numberVarAst = AstGenerator.getSimpleValue(param.value)
                    astJson.expression.argument.arguments.push(numberVarAst)
                    break
                case "HealingSnapshot":
                    let healingSnapshotVarAst = AstGenerator.getSnapshotPathAst(param.value)
                    astJson.expression.argument.arguments.push(healingSnapshotVarAst)
                    break;
                default:
                    break;
            }
        }
        //for gotoFrame function, will assign the returned variable to frame variable so that we can switch context
        if (functionAst.name == 'gotoFrame') {
            astJson = AstGenerator.getAssignFunctionResultToNormalVarOperation(this.inbuiltVarName.body.frameVarName, astJson)
        }
        else if (functionAst.name == 'switchTab') {
            astJson = AstGenerator.getDestructuringAssignment([[this.inbuiltVarName.body.pageVarName, this.inbuiltVarName.body.pageVarName], [this.inbuiltVarName.body.frameVarName, this.inbuiltVarName.body.frameVarName]], astJson.expression)
        }
        else if (functionAst.returnJsDoc && functionAst.returnJsDoc.value) {
            astJson = AstGenerator.getAssignmentFunctionResultToVarsDictOperation(this.inbuiltVarName.body.VariableStorageVarName, functionAst.returnJsDoc.value, astJson)
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