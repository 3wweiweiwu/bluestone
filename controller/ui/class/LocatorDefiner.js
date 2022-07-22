
const Locator = require('../../locator/class/Locator')
const { WorkflowRecord } = require('../../record/class/index')
const checkLocatorInDefiner = require('../../puppeteer/activities/checkLocatorInDefiner')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
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
     * @param {boolean} isReviewMode if we are in review mode, we will not validate final locator if it match proposed value
     */
    constructor(defaultSelector, locatorHtmlPath, locatorName, locatorSelector, potentialMatch, stepIndex, backend, parentFrame, isReviewMode = false, isRequiredLocatorUpdate = false) {

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
        this.isReviewMode = isReviewMode
        this.isRequiredLocatorUpdate = isRequiredLocatorUpdate
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
        btnLocatorOk: 'LOCATOR_LOCATOR_OKAY',
        btnNextHtml: 'LOCATOR_NEXT_HTML',
        btnPrevHtml: 'LOCATOR_PREVIOUS_HTML',
        btnOverrideLocator: 'LOCATOR_OVERRIDE_SELECTOR',
        recommendationDropDown: 'LOCATOR_RECOMMENDATION_DROPDOWN'
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
    getRecommendedLocator() {
        //list top 10 locators
        let groupElements = this.backend.operation.browserSelection.recommendedLocator.slice(0, 10)
        let recommendationGroup = groupElements.map(item => {
            let encodedStr = encodeURIComponent(item)
            return { text: item, url: `locator-definer-sidebar?${LocatorDefiner.inBuiltQueryKey.recommendationDropDown}=${encodedStr}` }
        })
        return recommendationGroup
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
        let param = null
        let newLocator = null
        switch (firstKey) {
            case LocatorDefiner.inBuiltQueryKey.recommendationDropDown:
                let recommendationSelection = decodeURIComponent(firstValue)
                this.locatorSelector = recommendationSelection
                break
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
            case LocatorDefiner.inBuiltQueryKey.btnOverrideLocator:
                if (this.stepIndex != -1) {
                    this.backend.steps[this.stepIndex].finalLocator = [this.locatorSelector]
                    this.backend.steps[this.stepIndex].finalLocatorName = this.locatorName

                    param = this.backend.steps[this.stepIndex].functionAst.params.find(item => {
                        return item.type.name == 'ElementSelector'
                    })
                    if (param) {
                        param.value = this.locatorName
                    }
                }

                //if we are in live locator generation mode, update finalLocator and potentialMatch list of current locator
                if (this.stepIndex == -1) {
                    newLocator = await this.backend.locatorManager.updateLocator(this.locatorName, [this.locatorSelector], this.locatorHtml, this.backend.operation.browserSelection.recommendedLocator)
                    //update potential match and current selected index for current element
                    let newLocatorIndex = this.backend.locatorManager.getLocatorIndexByName(this.locatorName)
                    this.backend.operation.browserSelection.potentialMatch.push(newLocator)
                    this.backend.operation.browserSelection.potentialMatch = [...new Set(this.backend.operation.browserSelection.potentialMatch)].filter(item => item != null)
                    this.backend.operation.browserSelection.currentSelectedIndex = newLocatorIndex
                    //update selector index for current selector
                    this.backend.puppeteer.setSelectorIndexForLocator(this.backend.operation.browserSelection.currentSelector, newLocatorIndex)
                }


                //specify locator function name in the param
                await this.backend.puppeteer.checkLocatorBasedOnDefiner(this.defaultSelector, this.locatorSelector, this.parentFrame)
                this.validationText += '[Locator Overriden]'
                await this.backend.puppeteer.openBluestoneTab("locator-definer")
                break
            case LocatorDefiner.inBuiltQueryKey.btnConfirm:
                let locatorCheckResult = ''
                if (this.isReviewMode == true && this.defaultSelector == this.locatorSelector) {
                    console.log('We are in reviwe mode and current locator selection match tested value. We will skip check')
                }
                else {
                    //check locator and confirm locator input
                    locatorCheckResult = await this.backend.puppeteer.checkLocatorBasedOnDefiner(this.defaultSelector, this.locatorSelector, this.parentFrame, this.isRequiredLocatorUpdate)
                    //will not update the locator if current locator is not valid
                    await this.backend.puppeteer.openBluestoneTab("locator-definer")
                }

                let finalSelection = this.getFinalSelection(locatorCheckResult)
                if (locatorCheckResult != '') break
                //add newly added selector to the locator library for future usage
                newLocator = await this.backend.locatorManager.updateLocator(this.locatorName, [this.locatorSelector], this.locatorHtml, this.backend.operation.browserSelection.recommendedLocator)

                //if we are in live locator generation mode, update finalLocator and potentialMatch list of current locator
                if (this.stepIndex == -1) {
                    //update potential match and current selected index for current element
                    let newLocatorIndex = this.backend.locatorManager.getLocatorIndexByName(this.locatorName)
                    this.backend.operation.browserSelection.potentialMatch.push(newLocator)
                    this.backend.operation.browserSelection.potentialMatch = [...new Set(this.backend.operation.browserSelection.potentialMatch)].filter(item => item != null)
                    this.backend.operation.browserSelection.currentSelectedIndex = newLocatorIndex
                    //update selector index for current selector
                    this.backend.puppeteer.setSelectorIndexForLocator(this.backend.operation.browserSelection.currentSelector, newLocatorIndex)
                }
                //mark currentSelectedIndex in the element to be current locator index
                //check all steps and replicate same setting for same locator
                for (let i = 0; i < this.backend.steps.length; i++) {
                    let item = this.backend.steps[i]
                    if (item.target == this.defaultSelector) {
                        this.backend.steps[i].finalLocator = finalSelection.finalLocator
                        this.backend.steps[i].finalLocatorName = finalSelection.finalLocatorName
                        this.backend.steps[i].isRequiredReview = false
                        //specify the locator name in the param
                        let param = item.functionAst.params.find(item => {
                            return item.type.name == 'ElementSelector'
                        })
                        if (param) {
                            param.value = finalSelection.finalLocatorName
                        }

                    }
                }


                break
            case LocatorDefiner.inBuiltQueryKey.btnNextHtml:
                if (this.stepIndex != -1)
                    this.backend.steps[this.stepIndex].updateHtmlForStep(1, this.backend.htmlCaptureStatus)
                this.locatorHtml = this.backend.convertLocalPath2RelativeLink(this.backend.htmlCaptureStatus.getHtmlByPath(this.locatorHtml, 1))
                break
            case LocatorDefiner.inBuiltQueryKey.btnPrevHtml:
                if (this.stepIndex != -1)
                    this.backend.steps[this.stepIndex].updateHtmlForStep(-1, this.backend.htmlCaptureStatus)
                this.locatorHtml = this.backend.convertLocalPath2RelativeLink(this.backend.htmlCaptureStatus.getHtmlByPath(this.locatorHtml, -1))
                break
            default:
                break;
        }
    }
}
module.exports = LocatorDefiner