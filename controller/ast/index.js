const fs = require('fs').promises
const acorn = require("acorn");
const walk = require("./lib/walk")
const extract = require('acorn-extract-comments')
const { JsDocSummary, JsDocEntry } = require('./class/JsDocSummary')
const doctrine = require("doctrine");
const path = require('path')

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
        /** @type {import('./class/Function')} */
        this.__funcRepo = null
    }
    /**
     * Based on the bluestone-func.js, parse function information
     * 
     */
    async loadFunctions() {
        let jsStr = await fs.readFile(this.__funcPath).toString()
        let ast = acorn.parse(jsStr)

        let bsFunction = require(this.funcPath)
        let functionKeys = Object.keys(bsFunction)

        let requireInfo = this.__getRequireInfo(ast)



        functionKeys.forEach(funcName => {
            //extract dynamic function info
            let mainFunc = bsFunction[funcName].func
            let locators = bsFunction[funcName].locators

            //extract static function info
            let currentNodeList = walk(output, (node) => {
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
            let funcNode = parentNode.properties.find(item => { return item.key.name == 'func' })

            let libraryName = funcNode.value.object.name
            let methodName = s1.value.property.name

            //TODO: based on library name, method name, parse informaton  to params, path and description





        })
        //get all available functions 

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
                let methodDescription = commentAST.description
                let jsDocEntry = new JsDocEntry(filePath, libraryName, methodName, methodDescription, commentAST.tags)
                jsDocSummary.add(jsDocEntry)

            })
        }

        return jsDocSummary
    }

}

module.exports = AST