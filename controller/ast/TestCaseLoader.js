const fs = require('fs').promises
const fsSync = require('fs')
const acorn = require("acorn");
const walk = require('./lib/walk')
const FunctionAst = require('../ast/class/Function')
const Param = require('../ast/class/JsDocTag')
const TestCase = require('../coder/class/Testcase')
const RecordingStep = require('../record/class/RecordingStep')
const AstManager = require('../ast/index')
const { LocatorManager } = require('../locator/index')
const config = require('../../config');
const path = require('path');
class ScriptBreaker {
    constructor(script) {
        this.script = script
        this.lineCharCountArray = this.#breakScriptToCharCount()
    }
    #breakScriptToCharCount() {
        let currentTotal = 0
        let lineCharCount = this.script.toString().split('\n').map(item => {

            let result = item.length + 1 + currentTotal
            currentTotal = result
            return result
        })
        return lineCharCount

    }
    /**
     * Based on line's end, decide which row are we in
     * @param {number} end 
     */
    getStepLineIndexByEndPoint(end) {
        for (let i = 0; i < this.lineCharCountArray.length; i++) {
            let lineEndCount = this.lineCharCountArray[i]
            if (lineEndCount >= end) {
                return i
            }
        }
    }
}
class TestcaseLoader {
    #filePath;
    #ast;
    #testSuite;
    #testCase;
    /**@type {AstManager} */
    #astManager
    /**@type {LocatorManager} */
    #locatorManager
    /** @type {Array<RecordingStep>} */
    steps

    /**
     * 
     * @param {string} filePath 
     * @param {LocatorManager} locatorManager 
     * @param {AstManager} astManager 
     */
    constructor(filePath, locatorManager, astManager) {
        this.#filePath = filePath
        this.#ast = null
        this.#testSuite = ''
        this.#testCase = ''
        this.#astManager = astManager
        this.#locatorManager = locatorManager
        this.steps = []
        this.scriptBreaker = null
    }

    get testCase() {
        return this.#testCase
    }
    get testSuite() {
        return this.#testSuite
    }
    async parseTc(isExtractTestInfo = true) {
        let fileInfo = await fs.readFile(this.#filePath)
        let fileStr = fileInfo.toString()
        this.scriptBreaker = new ScriptBreaker(fileStr)
        this.#ast = acorn.parse(fileStr, { ecmaVersion: 2022 })

        this.#testSuite = ''
        this.#testCase = ''

        if (isExtractTestInfo) {
            this.#testSuite = this.#extractTestSuiteName()
            this.#testCase = this.#extractTestcaseName()
        }
        this.steps = this.#extractTestStep(this.scriptBreaker)
    }

    /**
     * copy locator picture to public folder for display
     * @param {Function} pathGenFunc 
     */
    async copyStockLocatorPic(pathGenFunc) {

        for (const step of this.steps) {
            if (step.targetPicPath == '') continue
            try {
                await fs.access(step.targetPicPath)
            } catch (error) {
                /**@param {string} */
                let picPath = pathGenFunc()
                let sourcePicPath = path.join(config.code.pictureFolder, '..', step.targetPicPath)
                await fs.copyFile(sourcePicPath, picPath)
                step.targetPicPath = picPath
            }

        }
    }
    /**
     * Populate healing inforamtion
     */
    async getStepHealingInfo() {
        for (const step of this.steps) {
            try {
                await fs.access(step.healingTree)
                let healingBinary = await fs.readFile(step.healingTree)
                step.healingTree = healingBinary.toString()
            } catch (error) {
            }

        }
    }
    async getIFrameInfo() {
        let iFrame = []
        for (const step of this.steps) {
            step.iframe = iFrame
            if (step.command == 'gotoFrame') {
                let elementSelectorParam = step.functionAst.params.find(item => item.type.name == 'ElementSelector')
                iFrame = [elementSelectorParam.value]
            }
        }
    }
    /**
     * Get test suite name from the node
     * @returns {string}
     */
    #extractTestSuiteName() {
        let result = walk(this.#ast, (node, ancestor) => {
            if (ancestor.length < 2) return false
            let ancestorCheck = ancestor[ancestor.length - 2].type == 'CallExpression' && ancestor[ancestor.length - 2].callee.name == 'describe'
            let nodeCheck = node.type == 'Literal'
            return ancestorCheck && nodeCheck
        })
        return result[0].node.value
    }

    #extractTestcaseName() {
        let result = walk(this.#ast, (node, ancestor) => {
            if (ancestor.length < 2) return false
            let ancestorCheck = ancestor[ancestor.length - 2].type == 'CallExpression' && ancestor[ancestor.length - 2].callee.name == 'it'
            let nodeCheck = node.type == 'Literal'
            return ancestorCheck && nodeCheck
        })
        return result[0].node.value
    }
    /**
     * extract test step information 
     * @param {ScriptBreaker} scriptBreaker 
     * @returns {Array<RecordingStep>}
     */
    #extractTestStep(scriptBreaker) {
        // let startTime = Date.now()
        //narrow down the scope
        let result = walk(this.#ast, (node, ancestor) => {
            if (ancestor.length < 2) return false
            let ancestorCheck = ancestor[ancestor.length - 2].type == 'MemberExpression'
            let nodeCheck = node.type == "Identifier" && (node.name == TestCase.ConstVar.library.projectFuncLibrary || node.name == TestCase.ConstVar.library.bluestoneFuncLibrary)
            return nodeCheck && ancestorCheck
        }, (node, ancestor, result) => {
            return ancestor.length > 16 || result.length > 0
        })
        let newRange = result[0].ancestors[result[0].ancestors.length - 7]
        result = walk(newRange, (node, ancestor) => {
            if (ancestor.length < 2) return false
            let ancestorCheck = ancestor[ancestor.length - 2].type == 'MemberExpression'
            let nodeCheck = node.type == "Identifier" && (node.name == TestCase.ConstVar.library.projectFuncLibrary || node.name == TestCase.ConstVar.library.bluestoneFuncLibrary)
            return nodeCheck && ancestorCheck
        })
        // let completeTime = Date.now()
        // console.log((completeTime - startTime) / 1000)

        let allSteps = []
        for (const item of result) {
            let ancestorLength = item.ancestors.length
            let command = item.ancestors[ancestorLength - 3].object.property.name
            let args = item.ancestors[ancestorLength - 4].arguments
            //populate target field
            let target = 'no target'
            //populate function
            let functionAst
            let targetPicPath = ''
            let finalLocatorName = ''
            let finalLocator = ['']
            let htmlPath = ''
            let potentialMatch = []
            let healingTree = '{}'
            let locatorSnapshot = []
            try {
                functionAst = this.#astManager.getFunction(command)
                functionAst.params = this.#extractFunctionParam(args, functionAst.params)
                //populate target inforamtion
                let targetParam = functionAst.params.find(item => item.type.name == 'ElementSelector')
                if (targetParam != null) {
                    finalLocatorName = targetParam.value
                    let locatorObj = this.#locatorManager.locatorLibrary.find(item => item.path == finalLocatorName)
                    finalLocator = locatorObj.Locator
                    target = finalLocator[0]
                    targetPicPath = locatorObj.screenshot
                    htmlPath = ''
                    locatorSnapshot = locatorObj.locatorSnapshot
                }
                //populate healing information
                targetParam = functionAst.params.find(item => item.type.name == 'HealingSnapshot')
                if (targetParam != null) {
                    let snapshotFolder = path.join(config.code.dataPath, this.testCase, '/snapshot/')
                    let healingSnapshotFile = targetParam.value + '.json'
                    healingTree = path.join(snapshotFolder, healingSnapshotFile)

                }
            } catch (error) {
                //only print out error in the bluestone main console
                if (process.env.BLUESTONE_VAR_SAVER == null)
                    console.log(error)
            }


            //convert current function's start/end into script line number
            let expressionStatement = item.ancestors[ancestorLength - 6]
            //convert 0 based index to 1 based line number
            let scriptLineNumber = scriptBreaker.getStepLineIndexByEndPoint(expressionStatement.end) + 1
            let step = new RecordingStep({ command, functionAst, scriptLineNumber, target, finalLocator, finalLocatorName, targetPicPath, htmlPath, potentialMatch, healingTree })
            allSteps.push(step)
        }
        return allSteps
    }
    /**
     * Extract the param based on the argument from ast
     * @param {*} args Object argument from ast
     * @param {Array<Param>} functionParams param from function
     * @returns {Array<Param>}
     */
    #extractFunctionParam(args, functionParams) {
        functionParams.forEach((item, index) => {
            if (item.type.name == 'string' || item.type.name == 'number') {
                item.value = args[index].value
            }
            if (item.type.name == 'ElementSelector') {
                item.value = args[index].property.value
            }
            if (item.type.name == 'HealingSnapshot') {
                item.value = args[3].arguments[0].value
            }
        })
        return functionParams
    }
    /**
     * convert line number to step index
     * @param {number} lineNumber 
     * @returns {number}
     */
    getStepIndexFromLine(lineNumber) {
        let stepIndex = this.steps.findIndex(item => item.scriptLineNumber == lineNumber)
        return stepIndex
    }
}

module.exports = TestcaseLoader