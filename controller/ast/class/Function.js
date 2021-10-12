const Locator = require('../../locator/class/Locator')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
const Coder = require('../../coder/class/AstGenerator')
const AstGenerator = require('../../coder/class/AstGenerator')
class ArgumentNContext {
    /**
     * 
     * @param {*} currentScope 
     * @param {string} argumentStr 
     * @param {*} argDic
     */
    constructor(currentScope, argumentStr, argDic) {
        this.currentScope = currentScope
        this.argumentStr = argumentStr
        this.argDic = argDic
    }
}
class FunctionAST {
    /**
     * 
     * @param {string} path 
     * @param {string} name 
     * @param {string} description 
     * @param {Array<import('./JsDocTag')>} params 
     * @param {Function} mainFunc the main function to call during actual execution
     * @param {Array<Locator>} locator locator to sync-up from
     */
    constructor(path, name, description, params, locator, mainFunc) {
        this.path = path
        this.name = name
        this.description = description
        this.params = params
        this.locators = locator
        this.mainFunc = mainFunc
    }

    /**
     * Generate argument string based on the params
     * @param {import('puppeteer-core').Browser} browser 
     * @param {import('puppeteer-core').Page} page 
     * @param {ElementSelector} elementSelector 
     * @returns 
     */
    generateArgumentNContext(browser, page, elementSelector) {
        //construct argment for the function
        let currentOperation = this
        let currentScope = {}
        let currentParam = []
        let argDic = {}
        for (let i = 0; i < currentOperation.params.length; i++) {
            let param = currentOperation.params[i]
            //construct scope
            switch (param.type.name) {
                case "Page":
                    currentScope['page'] = page
                    currentParam.push('page')
                    break;
                case "Browser":
                    currentScope['browser'] = browser
                    currentParam.push('browser')
                    break;
                case "ElementSelector":
                    currentParam.push('elementSelector')
                    currentScope['elementSelector'] = elementSelector
                    break;
                case "String":
                    break;
                case "string":
                    currentParam.push(`decodeURIComponent("${encodeURIComponent(param.value)}")`)
                    break;
                case "number":
                    currentParam.push(`${param.value}`)
                    break
                default:
                    break;
            }
            argDic[param.description] = param.value
        }

        let argumentStr = currentParam.join(',')
        let result = new ArgumentNContext(currentScope, argumentStr, argDic)
        return result
    }
    generateAstForCommand(libraryName, methodName, locatorName, browserVarName = 'browser', pageVarName = 'page', elementVarName = 'locator') {

        let astJson = AstGenerator.getAwaitCommandWrapper(libraryName, methodName)
        for (let i = 0; i < currentOperation.params.length; i++) {
            let param = currentOperation.params[i]
            //construct scope
            switch (param.type.name) {
                case "Page":
                    let pageVarAst = AstGenerator.getPageArgAst(pageVarName)
                    astJson.expression.argument.arguments.push(pageVarAst)
                    break;
                case "Browser":
                    let browserVarAst = AstGenerator.getBrowserArgAst(browserVarName)
                    astJson.expression.argument.arguments.push(browserVarAst)
                    break;
                case "ElementSelector":
                    let elementVarAst = AstGenerator.getElementSelectorArgAst(elementVarName, locatorName)
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
}
module.exports = FunctionAST