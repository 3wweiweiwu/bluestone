const fs = require('fs').promises
const acorn = require("acorn");
const walk = require('./lib/walk')
const FunctionAst = require('../ast/class/Function')
const Param = require('../ast/class/JsDocTag')
const TestCase = require('../coder/class/Testcase')
const RecordingStep = require('../record/class/RecordingStep')
const AstManager = require('../ast/index')
const { LocatorManager } = require('../locator/index')
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
        let result = walk(this.#ast, (node, ancestor) => {
            if (ancestor.length < 2) return false
            let ancestorCheck = ancestor[ancestor.length - 2].type == 'MemberExpression'
            let nodeCheck = node.type == "Identifier" && (node.name == TestCase.ConstVar.library.projectFuncLibrary || node.name == TestCase.ConstVar.library.bluestoneFuncLibrary)
            return nodeCheck && ancestorCheck
        })
        let allSteps = []
        for (const item of result) {
            let ancestorLength = item.ancestors.length
            let command = item.ancestors[ancestorLength - 3].object.property.name
            let args = item.ancestors[ancestorLength - 4].arguments
            //populate function
            let functionAst
            try {
                functionAst = this.#astManager.getFunction(command)
                functionAst.params = this.#extractFunctionParam(args, functionAst.params)
            } catch (error) {
                //only print out error in the bluestone main console
                if (process.env.BLUESTONE_VAR_SAVER == null)
                    console.log(error)
            }


            //convert current function's start/end into script line number
            let expressionStatement = item.ancestors[ancestorLength - 6]
            //convert 0 based index to 1 based line number
            let scriptLineNumber = scriptBreaker.getStepLineIndexByEndPoint(expressionStatement.end) + 1
            let step = new RecordingStep({ command, functionAst, scriptLineNumber })
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
        })
        return functionParams
    }
}

module.exports = TestcaseLoader