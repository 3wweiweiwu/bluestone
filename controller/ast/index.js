const fs = require('fs').promises
const acorn = require("acorn");
const walk = require("./lib/walk")
const extract = require('acorn-extract-comments')
const { JsDocSummary, JsDocEntry } = require('./class/JsDocSummary')
const doctrine = require("doctrine");
const path = require('path')
const FunctionAST = require('./class/Function')
const BsFunc = require('./class/BsFunc')
const Locator = require('../locator/class/Locator')
class AST {
    //TODO: load function name, description
    //TODO: output .js file
    //TODO: modify locator path across the file
    /**
     * 
     * @param {string} locatorPath the path of the locator summary
     * @param {string} funcPath the path of the function summary
     */
    constructor(locatorPath, funcPath) {
        this.__locatorPath = locatorPath
        this.__funcPath = funcPath
        /** @type {Array<FunctionAST>} */
        this.__funcRepo = []
    }
    /**
     * Push current func ast to the repo
     * @param {FunctionAST} funcAst 
     */
    __addFuncAstToRepo(funcAst) {
        this.__funcRepo.push(funcAst)
    }
    get funcRepo() {
        return this.__funcRepo
    }
    /**
     * Based on the bluestone-func.js, parse function information
     * 
     */
    async loadFunctions() {
        let jsStr = (await fs.readFile(this.__funcPath)).toString()
        let ast = acorn.parse(jsStr, { ecmaVersion: 2020 })

        let bsFunction = require(this.__funcPath)
        let functionKeys = Object.keys(bsFunction)

        let requireInfo = await this.__getRequireInfo(ast)



        for (let i = 0; i < functionKeys.length; i++) {
            let funcName = functionKeys[i]
            //extract dynamic function info
            let mainFunc = bsFunction[funcName].func
            let locators = bsFunction[funcName].locators

            //extract static function info for current call
            let funcStaicInfo = await this.__getBsFuncInfo(ast, funcName)
            //Based on the static library and method name, correlate dynamic info
            let methodDetail = requireInfo.repo.find(info => {
                return info.libraryName == funcStaicInfo.libraryName && info.methodName == funcStaicInfo.methodName
            })

            //TODO: based on library name, method name, parse informaton  to params, path and description

            let functionAst = new FunctionAST(methodDetail.filePath, methodDetail.methodName, methodDetail.methodDescription, methodDetail.jsDocTag, locators, mainFunc)
            this.__addFuncAstToRepo(functionAst)



        }

    }

    /**
     * Get all require inforamtion
     * @param {acorn.Node} ast 
     * @returns {JsDocSummary}
     */
    async __getRequireInfo(ast) {
        let result = walk(ast, (node, ancestor) => {
            return (node.type == 'CallExpression') && node.callee.name == 'require' && node.arguments[0].type == 'Literal'
        })
        let jsFolder = path.dirname(this.__funcPath)
        let jsDocSummary = new JsDocSummary()
        for (let i = 0; i < result.length; i++) {
            let item = result[i]
            let libraryName = item.ancestors[1].id.name
            let filePath = path.join(jsFolder, item.node.arguments[0].value)
            if (!filePath.toLowerCase().endsWith('.js')) {
                filePath += '.js'
            }
            let funcJs = (await fs.readFile(filePath))
            funcJs = funcJs.toString()
            const commentObj = extract(funcJs, {})
            commentObj.comments.forEach(comment => {
                let methodName = comment.after.split('=')[0].trim().replace('exports.', '')
                let standardizedCommentStr = comment.value.split("\r\n").join('\n')
                let commentAST = doctrine.parse(standardizedCommentStr, { unwrap: true })

                //rearrange the parameter string so that it will align with the order
                commentAST = this.__rearrangeJsDocSequence(comment.after, commentAST)


                let methodDescription = commentAST.description

                let jsDocEntry = new JsDocEntry(filePath, libraryName, methodName, methodDescription, commentAST.tags)
                jsDocSummary.add(jsDocEntry)

            })
        }

        return jsDocSummary
    }

    /**
     * Based on the bluestone function static info, return library name and method name
     * @param {*} ast 
     * @param {string} funcName 
     * @returns {BsFunc}
     */
    async __getBsFuncInfo(ast, funcName) {
        //extract static function info
        let currentNodeList = walk(ast, (node) => {
            return node.type == 'Identifier' && node.name == funcName
        })
        if (currentNodeList.length != 1) {
            throw "Cannot find node specified. Need fix!"
        }


        let currentNode = currentNodeList[0]
        //get current function signature
        //go to parent node
        let parentNodeIndex = currentNode.ancestors.length - 2
        let parentNode = currentNode.ancestors[parentNodeIndex]
        let funcNode = parentNode.value.properties.find(item => { return item.key.name == 'func' })

        let libraryName = funcNode.value.object.name
        let methodName = funcNode.value.property.name
        let bsFunc = new BsFunc(libraryName, methodName)
        return bsFunc

    }
    /**
     * Rearrange jsdoc sequence based on function signature. If jsdoc does not allign with number of function signature, return error
     * @param {string} funcSignature 
     * @param {doctrine.Annotation} commentAST
     * @returns {doctrine.Annotation}
     */
    __rearrangeJsDocSequence(funcSignature, commentAST) {
        let parameterStr = funcSignature.replace(/.*\(/g, '').replace(/\).*/g, '')
        let parameters = parameterStr.split(',')
        let reArrangedTag = []

        //conduct parameter count check
        if (parameters.length != commentAST.tags.length) {
            throw `number of elements from function: ${funcSignature} does not match number of params in jsDoc.`
        }

        //rearrange the parameters
        parameters.forEach(item => {
            let tag = commentAST.tags.find(tag => { return tag.name == item.trim() })
            reArrangedTag.push(tag)
        })

        //conduct check and see if browser and and page are first 2 elements
        if (reArrangedTag[0].type.name != 'Browser') {
            throw `In function: ${funcSignature}, the 1st element type is not Browser. Did you import browser through const Browser = require('puppeteer-core').Browser and write @param {Browser} browser in jsdoc for 1st parameter?`
        }
        if (reArrangedTag[1].type.name != 'Page') {
            throw `In function: ${funcSignature}, the 2nd element type is not Page. Did you import browser through "const Browser = require('puppeteer-core').Page" and write "@param {Page} page" in jsdoc for 2nd parameter?`
        }

        commentAST.tags = reArrangedTag
        return commentAST

    }
}

module.exports = AST