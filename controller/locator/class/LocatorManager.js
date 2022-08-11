const Locator = require('./Locator')
const fs = require('fs').promises
const config = require('../../../config')
const path = require('path')
const LocatorAstGen = require('./LocatorAstGen')
const escodegen = require('escodegen')
const Support = require('./Support')
class LocatorManager {
    /**
     * Create Locator Manager Class     * 
     */
    constructor(locatorPath) {

        this.locatorPath = config.code.locatorPath
        if (locatorPath != null) {
            this.locatorPath = locatorPath
        }

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

                let newLocator = new Locator(value['locator'], value['screenshot'], newPath, value.snapshot)
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
     * @param {string[]} locatorSnapshot
     * @returns {Locator} if new locator is created, return this locator 
     */
    async updateLocator(locatorName, locatorValue, picPath, locatorSnapshot) {
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
            //if we do not specify new locator snapshot, we will use existing locator snapshot
            if (locatorSnapshot == null) {
                locatorSnapshot = []
            }
            targetLocator = new Locator(locatorValue, relativePicPath, locatorName, locatorSnapshot)
            this.locatorLibrary.push(targetLocator)
            newLocator = targetLocator
        }

        //check if update is required for the current locator. If so, update locator and screenshot path
        if (targetLocator.Locator[0] != locatorValue[0] || targetLocator.screenshot == '' || targetLocator.screenshot == null) {
            targetLocator.Locator = locatorValue
            targetLocator.screenshot = relativePicPath
            targetLocator.locatorSnapshot = locatorSnapshot
        }
        return JSON.parse(JSON.stringify(newLocator))

    }
    /**
     * output current locator change to the local disk
     */
    async outputLocatorToDisk() {
        /**@type {Locator[]} */
        let locatorSnapshotList = []
        //output locator informaiton
        let ast = LocatorAstGen.getModuleExportWrapper()
        this.locatorLibrary.forEach(item => {
            let cleanedLocatorSnapshotName = Support.getValidFileName(item.path)
            let locatorAst = LocatorAstGen.getLocatorStructure(item.path, item.Locator[0], item.screenshot, item.locatorSnapshot, cleanedLocatorSnapshotName)
            ast.body[0].expression.right.properties.push(locatorAst)
            if (item.locatorSnapshot) {
                locatorSnapshotList.push(item)
            }
        })
        let output = escodegen.generate(ast)
        await fs.writeFile(config.code.locatorPath, output)

        //output locator snapshot
        try {
            await fs.access(config.code.locatorSnapshotFolder)
        } catch (error) {
            fs.mkdir(config.code.locatorSnapshotFolder)
        }
        for (let item of locatorSnapshotList) {
            //clean up unsupported name
            let cleanedLocatorDisplayName = item.path
            cleanedLocatorDisplayName = Support.getValidFileName(cleanedLocatorDisplayName)

            //append file extension
            cleanedLocatorDisplayName += '.json'
            //output file into disk
            let locatorSnapshotPath = path.join(config.code.locatorSnapshotFolder, cleanedLocatorDisplayName)
            let outputStr = JSON.stringify(item.locatorSnapshot)
            await fs.writeFile(locatorSnapshotPath, outputStr)
        }

        //initialize locator information
        this.__initialize()
    }
    getLocatorIndexByName(locatorName) {
        return this.locatorLibrary.findIndex(item => item.path == locatorName)

    }
    /**
     * When recommended locator generation is ready, update recommended locator field 
     * @param {string} placeHolder the place holder id
     * @param {string[]} recommendedLocator recommended locator list
     */
    setRecommendedLocator(placeHolder, recommendedLocator) {
        let targetLocator = this.locatorLibrary.find(item => item.locatorSnapshot && item.locatorSnapshot[0] == placeHolder)
        if (targetLocator == null) return
        targetLocator.locatorSnapshot = recommendedLocator
    }
}

module.exports = LocatorManager