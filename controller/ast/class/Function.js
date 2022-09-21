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
     * @param {import('./JsDocTag')} returnJsDoc
     */
    constructor(path, name, description, params, locator, mainFunc, returnJsDoc) {
        this.path = path
        this.name = name
        this.description = description
        this.params = params
        this.locators = locator
        this.mainFunc = mainFunc
        this.returnJsDoc = returnJsDoc
    }

    /**
     * Generate argument string based on the params
     * @param {import('puppeteer-core').Browser} browser 
     * @param {import('puppeteer-core').Page} page 
     * @param {ElementSelector} elementSelector 
     * @param {import('puppeteer-core').Frame} frame 
     * @returns 
     */
    generateArgumentNContext(browser, page, elementSelector, frame) {
        //construct argment for the function
        let currentOperation = this
        let currentScope = {}
        let currentParam = []
        let argDic = {}
        for (let i = 0; i < currentOperation.params.length; i++) {
            let param = currentOperation.params[i]
            //construct scope
            switch (param.type.name) {
                case "VarSaver":
                    currentScope['vars'] = {}
                    currentParam.push('vars')
                    break;
                case "Frame":
                    currentScope['frame'] = frame
                    currentParam.push('frame')
                    break;
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
            if (param.value && param.value.toLowerCase && param.value.toLowerCase().startsWith('vars:')) {
                currentParam[currentParam.length - 1] = param.value.replace('vars:', 'variable[\'') + '\']'
            }
            argDic[param.description] = param.value
        }

        let argumentStr = currentParam.join(',')
        let result = new ArgumentNContext(currentScope, argumentStr, argDic)
        return result
    }
}
module.exports = FunctionAST