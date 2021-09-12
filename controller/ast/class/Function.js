const Locator = require('../../locator/class/Locator')
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
}
module.exports = FunctionAST