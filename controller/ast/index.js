const fs = require('fs').promises
const acorn = require("acorn");
const walk = require("./lib/walk")
const extract = require('extract-comments')
const { JsDocSummary, JsDocEntry } = require('./class/JsDocSummary')
const doctrine = require("doctrine");
const path = require('path')
const FunctionAST = require('./class/Function')
const BsFunc = require('./class/BsFunc')
const Locator = require('../locator/class/Locator')
const extractCommentForCustomziedFunctionClass = require('./lib/extractCommentForCustomizedFunctionClass')
const cliProgress = require('cli-progress');
const colors = require('ansi-colors');
class AST {
    /**
     * 
     * @param {string} locatorPath the path of the locator summary
     */
    constructor(locatorPath, funcPath) {
        this.__locatorPath = locatorPath
        /** @type {Array<FunctionAST>} */
        this.__funcRepo = []
    }
    /**
     * Push current func ast to the repo
     * @param {FunctionAST} funcAst 
     */
    __addFuncAstToRepo(funcAst) {
        //get rid of function whose id is similar to what we try to add
        this.__funcRepo = this.__funcRepo.filter(item => {
            return item.name != funcAst.name
        })
        this.__funcRepo.push(funcAst)
    }
    get funcRepo() {
        return this.__funcRepo
    }
    getFunction(name) {
        let func = this.__funcRepo.find(item => {
            return item.name.toUpperCase() == name.toUpperCase()
        })
        if (func == null) {
            return null
        }
        let newFunc = new FunctionAST(func.path, func.name, func.description, [], [], null)
        //clone the object to avoid multiple step refere to the same object
        if (func.mainFunc) {
            newFunc.mainFunc = func.mainFunc
        }
        if (func.locators) {
            newFunc.locators = JSON.parse(JSON.stringify(func.locators))
        }
        if (func.params) {
            newFunc.params = JSON.parse(JSON.stringify(func.params))
        }

        return newFunc
    }
    /**
     * @param {string} funcPath
     * Based on the bluestone-func.js, parse function information
     * 
     */
    async loadFunctions(funcPath) {
        let jsStr = (await fs.readFile(funcPath)).toString()
        let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
        //delete cached library and its dependencies
        if (require.cache[funcPath]) {
            require.cache[funcPath].children.forEach(item => {
                delete require.cache[item.id]
            })
        }

        delete require.cache[funcPath]
        let bsFunction = require(funcPath)
        let functionKeys = Object.keys(bsFunction)

        let requireInfo = await this.__getRequireInfo(ast, funcPath)

        const b1 = new cliProgress.SingleBar({
            format: 'Loading ' + funcPath + ' [{bar}] {percentage}% | {value}/{total}'
        }, cliProgress.Presets.shades_classic);

        b1.start(functionKeys.length, 0, {
            speed: "N/A"
        })
        let funcStaicInfoList = await this.__getBsFuncInfoList(ast, functionKeys)

        for (let i = 0; i < functionKeys.length; i++) {
            b1.increment()
            let funcName = functionKeys[i]
            //extract dynamic function info
            let mainFunc = bsFunction[funcName].func
            let locators = bsFunction[funcName].locators

            //extract static function info for current call
            let funcStaicInfo = funcStaicInfoList[i]
            //Based on the static library and method name, correlate dynamic info
            let methodDetail = requireInfo.repo.find(info => {
                return info.libraryName == funcStaicInfo.libraryName && info.methodName == funcStaicInfo.methodName
            })



            let functionAst = new FunctionAST(funcPath, funcName, methodDetail.methodDescription, methodDetail.jsDocTag, locators, mainFunc)
            this.__addFuncAstToRepo(functionAst)



        }
        b1.stop();

    }

    /**
     * Get all require inforamtion
     * @param {acorn.Node} ast 
     * @param {string} funcPath
     * @returns {JsDocSummary}
     */
    async __getRequireInfo(ast, funcPath) {
        let result = walk(ast, (node, ancestor) => {
            return (node.type == 'CallExpression') && node.callee.name == 'require' && node.arguments[0].type == 'Literal'
        }, (node, ancestors) => {
            return ancestors.length > 5
        })
        let jsFolder = path.dirname(funcPath)
        let jsDocSummary = new JsDocSummary()
        for (let i = 0; i < result.length; i++) {
            let item = result[i]
            let libraryName = item.ancestors[1].id.name
            let filePath = path.join(jsFolder, item.node.arguments[0].value)
            if (!filePath.toLowerCase().endsWith('.js')) {
                filePath += '.js'
            }
            let funcJs = null
            try {
                funcJs = (await fs.readFile(filePath))
            } catch (error) {
                // in case we cannot find file path (ex: if certain function is coming from bluestone's class, we won't load it)
                continue
            }

            funcJs = funcJs.toString()

            //hanlde legacy function definition pattern
            let commentObj = extract(funcJs, {})
            let newCommentFromClass = await extractCommentForCustomziedFunctionClass(funcJs)
            commentObj = [...newCommentFromClass, ...commentObj]
            commentObj.forEach(comment => {
                //only worry about the comment for the export function
                if (comment.type != 'BlockComment' || comment.code.context == null || comment.code.context.receiver != 'exports') {
                    return
                }
                let methodName = comment.code.context.name
                let standardizedCommentStr = comment.value.split("\r\n").join('\n')
                let commentAST = doctrine.parse(standardizedCommentStr, { unwrap: true })

                //rearrange the parameter string so that it will align with the order
                commentAST = this.__rearrangeJsDocSequence(comment.code.value, commentAST)


                let methodDescription = commentAST.description

                let jsDocEntry = new JsDocEntry(filePath, libraryName, methodName, methodDescription, commentAST.tags)
                jsDocSummary.add(jsDocEntry)

            })


        }

        //use blue

        return jsDocSummary
    }

    /**
     * Based on the bluestone function static info, return list of library name and method name
     * @param {*} ast 
     * @param {string[]} funcNameList 
     * @returns {BsFunc[]}
     */
    async __getBsFuncInfoList(ast, funcNameList) {
        //extract static function info
        let currentNodeList = walk(ast, (node, ancestors) => {
            let parentAncestorIndex = ancestors.length - 2
            return node.type == 'Identifier' && funcNameList.includes(node.name) && ancestors[parentAncestorIndex].type == 'Property'
        }, (node, ancestors) => {
            try {
                if (ancestors[0].type != 'ExpressionStatement') return true
                if (ancestors[1].type != 'AssignmentExpression') return true
                if (ancestors[2].type != 'ObjectExpression') return true
                if (ancestors[3].type != 'Property') return true
                if (ancestors[4].type != 'Identifier') return true
                if (ancestors.length > 6) return true
            } catch (error) {

            }
            return false
        })
        let bsFuncList = []
        for (const currentNode of currentNodeList) {
            //get current function signature
            //go to parent node
            let parentNodeIndex = currentNode.ancestors.length - 2
            let parentNode = currentNode.ancestors[parentNodeIndex]
            //depends on definition type(class or loose object), choose right parser
            let funcNode = null
            let libraryName = ''
            let methodName = ''
            if (parentNode.value.properties) {
                funcNode = parentNode.value.properties.find(item => { return item.key.name == 'func' })
                libraryName = funcNode.value.object.name
                methodName = funcNode.value.property.name
            }
            else if (parentNode.value.type == 'NewExpression') {
                libraryName = parentNode.value.callee.object.name
                methodName = parentNode.value.callee.property.name
            }
            else if (parentNode.value.type == 'ClassExpression') {
                funcNode = parentNode.value.body.body.find(item => item.key.name == 'func')
                libraryName = funcNode.value.object.name
                methodName = funcNode.value.property.name
            }
            else if (parentNode.value.type == 'MemberExpression') {
                libraryName = parentNode.value.object.name
                methodName = currentNode.node.name

            }


            let bsFunc = new BsFunc(libraryName, methodName)
            bsFuncList.push(bsFunc)
        }

        return bsFuncList

    }
    /**
     * Rearrange jsdoc sequence based on function signature. If jsdoc does not allign with number of function signature, return error
     * @param {string} funcSignature 
     * @param {doctrine.Annotation} commentAST
     * @returns {doctrine.Annotation}
     */
    __rearrangeJsDocSequence(funcSignature, commentAST) {
        let parameterStr = funcSignature.replace(/.*\(/g, '').replace(/\).*/g, '')
        let parameters = []
        //in case there is , within the function, this indicates that there is no parameter
        if (!funcSignature.includes('()')) {
            parameters = parameterStr.split(',')
        }
        let reArrangedTag = []
        let paramTags = commentAST.tags.filter(item => { return item.title == 'param' })
        //conduct parameter count check
        if (parameters.length != paramTags.length) {
            throw `number of elements from function: ${funcSignature} does not match number of params in jsDoc.`
        }

        //rearrange the parameters
        parameters.forEach(item => {
            let tag = commentAST.tags.find(tag => { return tag.name == item.trim() })
            reArrangedTag.push(tag)
        })



        commentAST.tags = reArrangedTag
        return commentAST

    }
}

module.exports = AST