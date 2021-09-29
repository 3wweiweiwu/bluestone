const Locator = require('./Locator')

class LocatorManager {
    /**
     * Create Locator Manager Class
     * @param {string} locatorPath path to bluestone-locator.js
     */
    constructor(locatorPath) {
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

}

module.exports = LocatorManager