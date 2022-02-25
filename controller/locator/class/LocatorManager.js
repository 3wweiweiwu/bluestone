const Locator = require('./Locator')
const fs = require('fs').promises
const config = require('../../../config')
const path = require('path')
const LocatorAstGen = require('./LocatorAstGen')
const LocatorSnapshot = require('./LocatorSnapshot')
const escodegen = require('escodegen')
class LocatorManager {
    /**
     * Create Locator Manager Class     * 
     */
    constructor(locatorPath) {

        this.locatorPath = config.code.locatorPath
        if (locatorPath != null) {
            this.locatorPath = locatorPath
        }
        /**@type {Array<LocatorSnapshot>} */
        this.__locatorSnapshot = []
        this.__initialize()
    }
    /**
     * Create Locator Manager Class
     * 
     */
    __initialize() {
        /** @type {Array<Locator>} */
        this.__locatorLibrary = []
        this.__parseLocator(this.locatorPath)
        this.lastRefreshTime = 0 //unit ms
    }
    get locatorLibrary() {
        return this.__locatorLibrary
    }
    set locatorLibrary(locatorLibrary) {
        this.__locatorLibrary = locatorLibrary
    }
    /**
     * Reset Active Locators to inactive
     */
    __resetActiveLocatorStatus() {
        this.locatorLibrary.forEach(item => {
            item.selector = null
        })
    }
    /**
     * Add locator snapshot into recording list
     * @param {string} name
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} innerText 
     * @param {Array<string>} backupLocators 
     */
    updateSnapshot(name, x, y, width, height, innerText, backupLocators) {
        let snapshot = new LocatorSnapshot(name, x, y, width, height, innerText, backupLocators)
        //delete locator snapshot with duplicate name
        this.__locatorSnapshot = this.__locatorSnapshot.filter(item => item.name != name)
        this.__locatorSnapshot.push(snapshot)
    }
    /**
     * Reset Locator's activation status and mark specific index to be active
     * @param {Array<number>} locatorIndexList 
     */
    setActiveLocator(locatorIndexList) {
        this.__resetActiveLocatorStatus()
        locatorIndexList.forEach(index => this.locatorLibrary[index].selector = true)
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
        delete require.cache[path]
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
     * @param {string[]} locatorValue 
     * @param {string} picPath 
     * @returns {Locator} if new locator is created, return this locator 
     */
    async updateLocator(locatorName, locatorValue, picPath) {
        let newLocator = null
        //copy picture into desinanated location
        let newPicName = locatorName.replace(/\W/g, '_') + '.png'
        let newPicPath = path.join(config.code.pictureFolder, newPicName)
        try {
            await fs.copyFile(picPath, newPicPath)
        } catch (error) {

        }


        //get relative path for the locator
        let locatorFolder = path.dirname(config.code.locatorPath)
        let relativePicPath = path.relative(locatorFolder, newPicPath)
        relativePicPath = relativePicPath.replace(/\\/g, '/')
        //add new locator into the library
        let targetLocator = this.locatorLibrary.find(item => { return item.path == locatorName })
        if (targetLocator == null) {
            targetLocator = new Locator(locatorValue, relativePicPath, locatorName)
            this.locatorLibrary.push(targetLocator)
            newLocator = targetLocator
        }

        //check if update is required for the current locator. If so, update locator and screenshot path
        if (targetLocator.Locator[0] != locatorValue[0] || targetLocator.screenshot == '' || targetLocator.screenshot == null) {
            targetLocator.Locator = locatorValue
            targetLocator.screenshot = relativePicPath
        }
        return JSON.parse(JSON.stringify(newLocator))

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
        await fs.writeFile(config.code.locatorPath, output)
        this.__initialize()
    }
    getLocatorIndexByName(locatorName) {
        return this.locatorLibrary.findIndex(item => item.path == locatorName)

    }

}

module.exports = LocatorManager