const Locator = require('./Locator')
const fs = require('fs').promises
const config = require('../../../config')
const path = require('path')
const LocatorAstGen = require('./LocatorAstGen')
const escodegen = require('escodegen')
class LocatorManager {
    /**
     * Create Locator Manager Class
     * @param {string} locatorPath path to bluestone-locator.js
     */
    constructor(locatorPath) {
        this.__initialize(locatorPath)
    }
    /**
     * Create Locator Manager Class
     * @param {string} locatorPath path to bluestone-locator.js
     */
    __initialize(locatorPath) {
        /** @type {Array<Locator>} */
        this.__locatorLibrary = []
        this.locatorPath = locatorPath
        this.__parseLocator(locatorPath)
        this.lastRefreshTime = 0 //unit ms
    }
    get locatorLibrary() {
        return this.__locatorLibrary
    }
    set locatorLibrary(locatorLibrary) {
        this.__locatorLibrary = locatorLibrary
    }
    /**
     * Return all active elements as an array
     * @returns {Array<Locator>}
     */
    getActiveSelectors() {
        let activeSelectors = this.locatorLibrary.filter(item => {
            return item.selector != null && item.selector != ''
        })
        return activeSelectors
    }
    /**
     * Load bluestone-locator.js and return locatorLibrary function
     * @param {*} path 
     * @returns {{Array<Locator>}
     */
    __parseLocator(path) {
        let locatorObj = require(path)
        //recursively go through all json node and create mapping
        this.__iterateThroughObject(locatorObj, [])
    }
    /**
     * Iterate through locator object and generate a array of Locator Obj
     * @param {*} currentObj 
     * @param {Array<string>} currentPathList 
     */
    __iterateThroughObject(currentObj = {}, currentPathList = []) {
        let keyList = Object.keys(currentObj)
        for (let i = 0; i < keyList.length; i++) {
            let key = keyList[i]
            let value = currentObj[key]

            //if current value is a string, go with next key
            if (typeof value === 'string' || value instanceof String) {
                continue
            }

            //if current node contains locator attribute and that happen to be an array, push result into library            
            let newPath = []
            try {

                newPath = key
            } catch (error) {
                console.log(error)
            }

            let potentialLocator = value['locator']
            if (potentialLocator != null && Array.isArray(potentialLocator) && potentialLocator.length > 0) {


                let newLocator = new Locator(value['locator'], value['screenshot'], newPath)
                this.__locatorLibrary.push(newLocator)
                continue
            }

            this.__iterateThroughObject(value, newPath)
        }
    }

    /**
     * Update current locator library based on the input value
     * @param {string} locatorName 
     * @param {string} locatorValue 
     * @param {string} picPath 
     */
    async updateLocator(locatorName, locatorValue, picPath) {
        //copy picture into desinanated location
        let newPicName = locatorName.replace(/\W/g, '_') + '.png'
        let newPicPath = path.join(config.code.pictureFolder, newPicName)
        await fs.copyFile(picPath, newPicPath)

        //get relative path for the locator
        let relativePicPath = path.relative(config.code.locatorPath, newPicPath)

        //add new locator into the library
        let targetLocator = this.locatorLibrary.find(item => { return item.path == locatorName })
        if (targetLocator == null) {
            targetLocator = new Locator(locatorValue, relativePicPath, locatorName)
            this.locatorLibrary.push(targetLocator)
        }

        //check if update is required for the current locator. If so, update locator and screenshot path
        if (targetLocator.Locator[0] != locatorValue[0]) {
            targetLocator.Locator = locatorValue
            targetLocator.screenshot = targetLocator
        }

    }
    /**
     * output current locator change to the local disk
     */
    async outputLocatorToDisk() {

        let ast = LocatorAstGen.getModuleExportWrapper()
        this.locatorLibrary.forEach(item => {
            let locatorAst = LocatorAstGen.getLocatorStructure(item.path, item.Locator[0], item.screenshot)
            ast.body[0].expression.right.properties.push(locatorAst)
        })
        let output = escodegen.generate(ast)
        await fs.writeFile(config.code.locatorPath,output)
    }

}

module.exports = LocatorManager