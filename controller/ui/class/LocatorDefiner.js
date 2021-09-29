const Locator = require('../../locator/class/Locator')

class FinalLocatorSelection {
    constructor() {
        this.finalLocatorName = ''
        this.finalLocator = ''
    }
}

class LocatorDefiner {
    /**
     * 
     * @param {string} defaultSelector the default selector from locator generation library
     * @param {string} locatorHtmlPath the html path of current locator
     * @param {string} locatorName the name of current locator. If it is a new locator, you shold provide ''
     * @param {string} locatorSelector the selector info. If '' is provided, it means that there is no potential match
     * @param {Array<Locator>} potentialMatch the potential match info coming from the recording step
     */
    constructor(defaultSelector, locatorHtmlPath, locatorName, locatorSelector, potentialMatch) {
        this.__isSelectorValid = false
        this.defaultSelector = defaultSelector
        this.__locatorName = locatorName
        this.__locatorSelector = locatorSelector
        this.locatorHtml = locatorHtmlPath

        this.__possibleLocators = potentialMatch.map(item => {
            return {
                name: item.path,
                selector: item.Locator[0],
                pic: item.screenshot,
            }
        })
    }

    get locatorName() {
        return this.__locatorName
    }
    get locatorSelector() {
        return this.__locatorSelector
    }
    set locatorSelector(info) {
        this.__locatorSelector = info
    }
    set locatorName(info) {
        this.__locatorName = info
    }
    set isSelectorValid(result) {
        this.__isSelectorValid = result
    }
    /**
     * Generate validation text based on locator name and locator validation result
     * If everything looks good, it will returns an empty string
     * @returns {string}
     */
    getValidationText() {
        let text = ''
        if (!this.__isSelectorValid) {
            text += 'Current selector you provide is invalid. Please try it again. If do not understand what you are doing, please click on default button'
        }
        if (locatorName == '') {
            text += 'No locator name is specified. Please specify locator name'
        }
        return text
    }
    useDefaultSelector() {
        this.__locatorSelector = this.defaultSelector
    }
    get possibleLocators() {
        return this.__possibleLocators
    }
    /**
     * Based on the current inforamtion, generate final locator name and final locator
     * If current condition does not satisfy our need, it will return empty string for 
     * finalLocatorName nad finalLocator
     */
    getFinalSelection() {
        let finalSelection = new FinalLocatorSelection()
        //if no validation text is provided, it means everything looks good.
        //if anything goes wrong, we will not populate info for finalLocatorName and finalLocator
        if (this.getValidationText() == '') {
            //need to returns array here
            finalSelection.finalLocator = [this.__locatorSelector]
            finalSelection.finalLocatorName = this.__locatorName

        }
        return finalSelection
    }
}
module.exports = LocatorDefiner