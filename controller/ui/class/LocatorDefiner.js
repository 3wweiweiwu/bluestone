
const Locator = require('../../locator/class/Locator')
const { WorkflowRecord } = require('../../record/class/index')
const checkLocatorInDefiner = require('../../puppeteer/activities/checkLocatorInDefiner')
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
     * @param {number} stepIndex the index of current step. We need this inforamtion so that we can navigate back when we change the inforamtion in the step
     * @param {WorkflowRecord} backend the workflow record backend
     * @param {Array<string>} parentFrame the parent frame hierachy
     */
    constructor(defaultSelector, locatorHtmlPath, locatorName, locatorSelector, potentialMatch, stepIndex, backend, parentFrame) {

        this.__selectorValidationNote = ''
        this.defaultSelector = defaultSelector
        this.__locatorName = locatorName
        this.__locatorSelector = locatorSelector
        this.locatorHtml = locatorHtmlPath
        this.__validationText = 'Please click Confirm button to validate your input'
        this.__possibleLocators = potentialMatch.map(item => {
            return {
                name: item.path,
                selector: item.Locator[0],
                pic: item.screenshot,
            }
        })
        this.stepIndex = stepIndex
        this.backend = backend
        this.fullLocatorFromPossibleLocator = null
        this.parentFrame = parentFrame

    }
    get validationText() {
        return this.__validationText
    }

    set validationText(text) {
        this.__validationText = text
    }
    static inBuiltQueryKey = {
        btnRevert: 'LOCATOR_REVERT_SELECTOR',
        txtLocatorName: 'LOCATOR_LOCATOR_NAME',
        txtLocator: 'LOCATOR_LOCATOR',
        btnConfirm: 'LOCATOR_CHECK_LOCATOR',
        btnLocatorOk: 'LOCATOR_LOCATOR_OKAY'
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

    /**
     * Generate validation text based on locator name and locator validation result
     * If everything looks good, it will returns an empty string
     * @param {string} locatorCheckErr this is locator check error from puppeteer.validateLocator function
     * @returns {string}
     */
    validateLocator(locatorCheckErr) {
        let text = ''
        if (this.locatorSelector == '') {
            text += 'Please enter valid locator'
        }
        else {
            text += locatorCheckErr
        }


        if (this.locatorName == '') {
            text += 'Please specify locator name'
        }

        this.validationText = text
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
     * @param {string} locatorCheckErr This information is provided by puppeteerControl.checkLocatorInDefiner
     */
    getFinalSelection(locatorCheckErr) {
        let finalSelection = new FinalLocatorSelection()
        //if no validation text is provided, it means everything looks good.
        //if anything goes wrong, we will not populate info for finalLocatorName and finalLocator
        let result = this.validateLocator(locatorCheckErr)
        if (result == '') {
            //need to returns array here
            finalSelection.finalLocator = [this.locatorSelector]
            finalSelection.finalLocatorName = this.locatorName

        }
        return finalSelection
    }
    async update(query) {
        let queryKeys = Object.keys(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        switch (firstKey) {
            case LocatorDefiner.inBuiltQueryKey.btnRevert:
                this.locatorSelector = this.defaultSelector
                break;
            case LocatorDefiner.inBuiltQueryKey.txtLocator:
                this.locatorSelector = firstValue
                break
            case LocatorDefiner.inBuiltQueryKey.txtLocatorName:
                this.locatorName = firstValue
                break

            case LocatorDefiner.inBuiltQueryKey.btnLocatorOk:
                this.locatorName = this.possibleLocators[firstValue].name
                this.locatorSelector = this.possibleLocators[firstValue].selector
                break
            case LocatorDefiner.inBuiltQueryKey.btnConfirm:
                //check locator and confirm locator input
                let locatorCheckResult = await this.backend.puppeteer.checkLocatorInDefiner(this.defaultSelector, this.locatorSelector, this.parentFrame)
                //will not update the locator if current locator is not valid


                let finalSelection = this.getFinalSelection(locatorCheckResult)
                if (locatorCheckResult != '') break
                //check all steps and replicate same setting for same locator
                this.backend.steps.forEach(item => {
                    if (item.target == this.defaultSelector) {
                        item.finalLocator = finalSelection.finalLocator
                        item.finalLocatorName = finalSelection.finalLocatorName
                        //specify the locator name in the param
                        let param = item.functionAst.params.find(item => {
                            return item.type.name == 'ElementSelector'
                        })
                        if (param) {
                            param.value = finalSelection.finalLocatorName
                        }

                    }
                })

                break
            default:
                break;
        }
    }
}
module.exports = LocatorDefiner