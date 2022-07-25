const LocatorDefiner = require('./class/LocatorDefiner')
const Operation = require('./class/Operation')
const Workflow = require('./class/Workflow')
const { WorkflowRecord, RecordingStep } = require('../record/class')
const path = require('path')
const fs = require('fs').promises
class UI {
    /**
     * 
     * @param {WorkflowRecord} backend 
     */
    constructor(backend) {
        this.backend = backend
        this.locatorDefiner = new LocatorDefiner('', '', '', '', [], -1, this.backend, [])
        this.operation = new Operation(this.backend)
        this.workflow = new Workflow([], this.backend)

    }
    async updateUserInputForSpy(query) {
        let queryKeys = Object.keys(query)
        //if there is no query, we will just return
        if (queryKeys.length == 0) {
            return
        }
        //decode uri component for the query
        queryKeys.forEach(key => { query[key] = decodeURIComponent(query[key]) })
        await this.operation.update(query)
        await this.workflow.update(query)
        await this.locatorDefiner.update(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        let targetStep, stepIndex
        switch (firstKey) {
            case Workflow.inBuiltQueryKey.btnEditWorkflow:
                targetStep = this.backend.steps[firstValue]
                this.__repopulateOperationUI(targetStep)
                break
            case Workflow.inBuiltQueryKey.btnResolveLocatorQueryKey:

                this.backend.resolveExistingLocatorInSteps()
                // await this.backend.fixHtmlPathIssue(this.backend.htmlCaptureStatus)
                stepIndex = this.backend.findPendingLocatorInStep()
                if (stepIndex != -1) {
                    targetStep = this.backend.steps[stepIndex]
                    await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex, targetStep.iframe)
                }

                stepIndex = this.backend.getFailedOrReviewRequiredStepIndex()
                if (stepIndex != -1) {
                    targetStep = this.backend.steps[stepIndex]
                    await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex, targetStep.iframe)
                }

                //write code to disk automatically
                if (this.workflow.validateForm(true)) {
                    this.workflow.validateForm()
                    let finalPath = await this.backend.writeCodeToDisk(this.workflow.textTestSuiteValue, this.workflow.textTestCaseValue)
                    this.workflow.txtValidationStatus += `. Script Path: ${finalPath}`
                }



                break

            case Workflow.inBuiltQueryKey.btnLocatorWorkflow:
                stepIndex = Number.parseInt(firstValue)
                targetStep = this.backend.steps[stepIndex]
                await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex, targetStep.iframe, targetStep.isRequiredReview, targetStep.isRequiredLocatorUpdate)
                break
            default:
                break;
        }
    }
    /**
     * Initialize Locator Definer page based on information from current locator information from workflow page
     * @param {string} defaultSelector 
     * @param {string} locatorHtmlPath 
     * @param {string} locatorName 
     * @param {Array<string>} locatorSelector 
     * @param {Array<Locator>} potentialMatch 
     * @param {Array<string>} parentFrame
     * @param {number} stepIndex
     * @param {boolean} isReviewMode
     */
    async refreshLocatorDefiner(defaultSelector, locatorHtmlPath, locatorName, locatorSelector, potentialMatch, stepIndex, parentFrame, isReviewMode = false, isRequiredLocatorUpdate = false) {
        //convert html path from local file to relative url
        let htmlUrl = this.backend.convertLocalPath2RelativeLink(locatorHtmlPath)

        //create a new object because we are going to modify screenshot key direclty
        let newPotentialMatch = await this.__updatePotentialMatchStockPic(potentialMatch)
        await this.backend.updateLocatorDefinerPic(locatorHtmlPath)
        this.locatorDefiner = new LocatorDefiner(defaultSelector, htmlUrl, locatorName, locatorSelector[0], newPotentialMatch, stepIndex, this.backend, parentFrame, isReviewMode, isRequiredLocatorUpdate)
    }
    /**
     * Based on the current step in the workflow, repopulate operation view
     * @param {RecordingStep} step 
     */
    __repopulateOperationUI(step) {

        let currentGroupKeys = Object.keys(this.backend.operationGroup)
        let findOperation = false
        for (let i = 0; i < currentGroupKeys.length; i++) {
            let groupKey = currentGroupKeys[i]
            /** @type {Array<FunctionAST>} */
            let operations = this.backend.operationGroup[groupKey].operations
            let currentOperation = operations.find(item => {
                if (item == null) return false
                return item.name == step.command
            })

            if (currentOperation != null) {
                this.operation.spy.userSelection.currentGroup = groupKey
                this.operation.spy.userSelection.currentOperation = step.functionAst.name
                this.operation.browserSelection.currentInnerText = step.targetInnerText
                this.operation.browserSelection.currentSelector = step.target
                this.operation.browserSelection.selectorPicture = step.targetPicPath
                this.operation.browserSelection.lastOperationTimeoutMs = step.timeoutMs
                this.operation.browserSelection.parentIframe = step.iframe
                for (let i = 0; i < currentOperation.params.length; i++) {
                    currentOperation.params[i].value = step.functionAst.params[i].value
                }
                findOperation = true
                break
            }

        }
        if (!findOperation) {
            this.backend.operation.spy.result.isPass = false
            this.backend.operation.spy.result.text = `Unable to find function ${step.command}`
        }
    }
    /**
     * Update picture in the potential match and copy them from project to local disk
     * @param {Array<Locator>} potentialMatch 
     * @returns {Array<Locator>}
     */
    async __updatePotentialMatchStockPic(potentialMatch) {
        //iframe may not have potentaial match
        if (potentialMatch == null) return
        /** @type {Array<Locator>} */
        let newPotentialMatch = JSON.parse(JSON.stringify(potentialMatch))
        //copy over locator pictures to temp folder for visualization
        let bluestoneFuncFolder = path.dirname(this.backend.locatorManager.locatorPath)
        for (let i = 0; i < newPotentialMatch.length; i++) {
            let item = newPotentialMatch[i]
            //no pic
            if (item.screenshot == null) {
                continue
            }
            let sourcePath = path.join(bluestoneFuncFolder, item.screenshot)
            let newPicPath = this.backend.getPicPath()
            //check if file path is valid
            try {
                await fs.access(sourcePath);
                await fs.copyFile(sourcePath, newPicPath)

            } catch (err) {
                continue
            }
            newPotentialMatch[i].screenshot = this.operation.getSpySelectorPictureForPug(newPicPath)
        }
        return newPotentialMatch
    }
    async updateLocatorDefinerBasedOnSelection() {
        let browserSelection = this.backend.operation.browserSelection
        let selectedIndex = browserSelection.currentSelectedIndex
        let locatorName = ''
        let finalSelector = ''
        let locatorSelector = ''
        let potentialMatch = browserSelection.potentialMatch
        let newPotentialMatch = await this.__updatePotentialMatchStockPic(potentialMatch)
        if (selectedIndex) {
            let locator = this.backend.locatorManager.locatorLibrary[selectedIndex]
            locatorName = locator.path
            locatorSelector = locator.Locator[0]
        }
        let htmlUrl = this.backend.convertLocalPath2RelativeLink(this.backend.htmlCaptureStatus.lastFilePath)


        this.locatorDefiner = new LocatorDefiner(browserSelection.currentSelector, htmlUrl, locatorName, locatorSelector, newPotentialMatch, -1, this.backend, browserSelection.parentIframe)

    }
}

module.exports = UI
