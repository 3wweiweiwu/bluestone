const path = require('path')
const config = require('../../../config')
const { LocatorManager, Locator } = require('../../locator/index')
const AstManager = require('../../ast')
const FunctionAST = require('../../ast/class/Function')
const JsDocTag = require('../../ast/class/JsDocTag')
const { testTextEqual } = require('../../../ptLibrary/functions/inbuiltFunc')
const _eval = require('eval')
const StepResult = require('./StepResult')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
const { Page } = require('puppeteer-core')
const PuppeteerControl = require('../../puppeteer/class')
const fs = require('fs').promises

/**
 * @typedef {string} CommandType
 **/

/**
 * @typedef {string} Selector
 **/

/**
 * @typedef ExistingSelector
 * @property {Selector} selector
 * @property {string} path
 */

/**
 * @enum {CommandType}
 */
var COMMAND_TYPE = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
    goto: 'goto'
}


class RecordingStep {
    /** 
     * @param {step} recordingStep 
     */
    constructor(recordingStep) {
        this.command = recordingStep.command
        this.target = recordingStep.target
        /** @type {Array<Locator>} */
        this.potentialMatch = []

        this.htmlPath = recordingStep.htmlPath
        this.targetInnerText = recordingStep.targetInnerText
        this.targetPicPath = recordingStep.targetPicPath
        this.timeoutMs = recordingStep.timeoutMs
        this.meta = {}

        this.finalLocatorName = ''
        if (recordingStep.finalLocatorName) {
            this.finalLocatorName = recordingStep.finalLocatorName
        }
        this.finalLocator = ''
        if (recordingStep.finalLocator) {
            this.finalLocator = recordingStep.finalLocator
        }
        this.functionAst = recordingStep.functionAst
        if (this.functionAst) {
            this.parameter = JSON.parse(JSON.stringify(recordingStep.functionAst.params))
        }
        this.result = new StepResult()

    }
    setFinalLocator(finalLocatorName, finalLocator) {
        this.finalLocatorName = finalLocatorName
        this.finalLocator = finalLocator
    }
}
/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'} command
 * @property {number} target
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 * @property {string} htmlPath
 * @property {string} targetPicPath
 * @property {import('../../ast/class/Function')} functionAst
 */


class WorkflowRecord {
    /**     * 
     * @param {PuppeteerControl} puppeteer 
     */
    constructor(puppeteer) {
        //TODO: seperate step into another class
        this.puppeteer = puppeteer
        this.name = ''
        /** 
         * @type {Array<RecordingStep>} 
         */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
        this.__isRecording = true
        this.astManager = new AstManager(config.code.locatorPath)

        this.operationGroup = {
            customizedFunctions: {
                text: 'Run Customzied Function',
                operations: []
            }
        }

        this.operation = {
            spy: {
                runCurrentOperation: false,
                visible: false,
                result: { isPass: null, text: '' },
            },
            browserSelection: {
                currentSelector: '',
                selectorPicture: '',
                selectorHtmlPath: '',
                currentInnerText: 'default',
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lastOperationTime: Date.now(),
                lastOperationTimeoutMs: 0,
                currentOpeartion: null
            },
        }

        this.locatorManager = new LocatorManager(config.code.locatorPath)
        this.inbuiltFuncPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        this.astManager.loadFunctions(config.code.funcPath)
        this.astManager.loadFunctions(this.inbuiltFuncPath)
    }
    getCurrentOperation() {
        return this.operation.browserSelection.currentOpeartion
    }

    /**
     * Convert local path to relative path
     * @param {string} localPath 
     */
    convertLocalPath2RelativeLink(localPath) {
        let fileBaseDir = __dirname
        let projectBase = path.resolve(fileBaseDir, '../../../')
        localPath = path.resolve(localPath)
        let resultLink = ''
        if (localPath.includes(projectBase)) {
            resultLink = localPath.replace(projectBase, '')
            resultLink = resultLink.replace('\\public', '').replace(/\\/g, '/')

        }
        //handle windows path


        return resultLink
    }
    static inBuiltFunc = {
        testTextEqual: 'testTextEqual',
        testElementVisible: 'testElementVisible',
        testElementInvisible: 'testElementInvisible',
        waitElementExists: 'waitElementExists',
        hoverMouse: 'hoverMouse',
        change: 'change',
        click: 'click',
        goto: 'goto',
        keydown: 'keydown'
    }
    static inbuiltEvent = {
        refresh: PuppeteerControl.inbuiltEvent.refresh
    }
    /**
     * Based on the active functions, populate available functions in the group
     * @param {Array<import('../../ast/class/Function')>} activeFunctions 
     */
    mapOperationToGroups(activeFunctions) {
        const inBuiltFuncNames = [
            WorkflowRecord.inBuiltFunc.testTextEqual,
            WorkflowRecord.inBuiltFunc.testElementVisible,
            WorkflowRecord.inBuiltFunc.testElementInvisible,
            WorkflowRecord.inBuiltFunc.hoverMouse
        ]
        //populate default list
        let groupInfo = {
            assert: {
                text: 'Verify',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.testTextEqual)
                ]
            },
            waitTill: {
                text: 'Wait Till',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.testElementVisible),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.testElementInvisible)
                ]
            },
            inbuiltFunction: {
                text: 'Run In-built function',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitElementExists),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.change),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.goto),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.click),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.keydown),
                ]
            },
            customizedFunctions: {
                text: this.operationGroup.customizedFunctions.text,
                operations: []
            }
        }
        //populate customized function
        let customizedFunctions = activeFunctions.filter(item => {
            return !inBuiltFuncNames.includes(item.name)
        })
        groupInfo.customizedFunctions.operations = customizedFunctions
        this.operationGroup = groupInfo

    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     */
    __addWaitForSteps(step) {
        let waitCommand = 'waitElementExists'
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != waitCommand && step.timeoutMs != 0) {
            let waitFunctionAst = this.astManager.getFunction(waitCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            waitStep.command = waitCommand
            waitStep.functionAst = waitFunctionAst
            //hard code wait time param here
            waitStep.functionAst.params[2].value = step.timeoutMs
            this.steps.push(waitStep)
        }

    }
    /**
     * Correlate steps with existing locator. IF there is one and exactly one match, we will autoamtically map the step with the locator
     */
    resolveExistingLocatorInSteps() {
        //automatically match all existing selectors
        this.steps.forEach(item => {
            if (item.potentialMatch.length == 1) {
                item.finalLocatorName = item.potentialMatch[0].Locator
                item.finalLocator = item.potentialMatch[0].path
            }
        })
    }
    /**
     * Get index of the step that haven't been mapped
     * -1 if nothing being found
     * @returns {number}
     */
    findPendingLocatorInStep() {
        let stepIndex = -1;
        //find out selector that is pending correlaton
        stepIndex = this.steps.findIndex(item => {
            return item.finalLocator == '' || item.finalLocator == ''
        })
        return stepIndex
    }
    /**
     * Run All steps and assign result to step.
     * @returns {number} index of the failed step. -1 if everything pass
     */
    async runAllSteps() {
        await this.puppeteer.cleanCache()
        let failedStepIndex = -1
        //check if there is any un-correlated locator in step
        failedStepIndex = this.findPendingLocatorInStep()
        if (failedStepIndex != -1) {
            this.steps[failedStepIndex].result = new StepResult()
            this.steps[failedStepIndex].result.resultText = 'Locator has not been correleated'
            return failedStepIndex
        }

        //run step one by one
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i]
            let elementSelector = new ElementSelector(step.finalLocator, '', step.finalLocatorName)

            let result = await this.puppeteer.runCurrentStep(step.functionAst, elementSelector)
            this.steps[i].result = result
            if (!result.isResultPass) {
                failedStepIndex = i
                break
            }
        }
        return failedStepIndex
    }
    /**
     * get active functions based on active elements on screen
     * @returns {Array<import('../../ast/class/Function')>}
     */
    getActiveCustomFunctions() {
        this.operationGroup.customizedFunctions.operations = []
        let activeElements = this.locatorManager.getActiveSelectors()
        //convert active elements into array of javascript string for the ease of the comparison
        let jsonLocatorArray = activeElements.map(element => {
            return JSON.stringify(element.Locator)
        })

        let activeFunctions = this.astManager.funcRepo.filter(func => {

            let areAllLocatorActive = func.locators.every(loc => {
                let strLocJson = JSON.stringify(loc.locator)
                return jsonLocatorArray.includes(strLocJson)
            })
            return areAllLocatorActive
        })

        return activeFunctions
    }
    set spyVisible(isVisible) {
        this.operation.spy.visible = isVisible
    }
    get spyVisible() {
        return this.operation.spy.visible
    }
    set spyBrowserSelectionPicPath(picturePath = '') {
        this.operation.browserSelection.selectorPicture = picturePath
    }
    set spyBrowserSelectionHtmlPath(htmlPath = '') {
        this.operation.browserSelection.selectorHtmlPath = htmlPath
    }








    /**
     * Set Last operation time
     */
    setLastOperationTime() {
        this.operation.browserSelection.lastOperationTime = Date.now()
    }




    set isRecording(recordStatus) {
        this.__isRecording = recordStatus
    }
    get isRecording() {
        return this.__isRecording
    }
    /**
     * Refresh available functionGroup based on active element in current screen
     * This function will load both inbuilt function and custom function
     */
    async refreshActiveFunc() {

        await this.astManager.loadFunctions(config.code.funcPath)
        let activeFuncs = this.getActiveCustomFunctions()
        this.mapOperationToGroups(activeFuncs)
    }
    /**
     * add current event to the list
     * @param {RecordingStep} event 
     */
    async addStep(event) {
        //TODO: handle change event, it should give us data
        event.potentialMatch = this.__findPotentialMatchForEvent(event.target)
        this.__addWaitForSteps(event)

        this.steps.push(event)
        this.__handleChangeNPressCombo(event)
        await this.refreshActiveFunc()


        this.setLastOperationTime()
    }
    /**
     * check if current command is change call and see if prior step is press key and timeout is small (0<x<100ms)
     * We do this because often times,change event will comes later than the press key event. We have to manually
     * reorder the steps to issue. We want to ensure timeout is greater than 0 as people might manually add command
     * And manual command will have timeout of 0
     * @param {RecordingStep} step 
     * @returns 
     */
    async __handleChangeNPressCombo(step) {
        if (step.timeoutMs > 0 && step.timeoutMs < 400 && step.command == 'change' && this.steps[this.steps.length - 3].command == 'keydown') {
            let waitStepForChange = this.steps[this.steps.length - 2]
            let actionStepForChange = this.steps[this.steps.length - 1]
            let actionStepForPress = this.steps[this.steps.length - 3]
            let waitStepForPress = this.steps[this.steps.length - 4]

            waitStepForChange.functionAst.params[2].value = waitStepForPress.timeoutMs


            this.steps.splice(this.steps.length - 4, 4)
            this.steps.push(waitStepForChange)
            this.steps.push(actionStepForChange)
            this.steps.push(waitStepForPress)
            this.steps.push(actionStepForPress)


        }
    }
    /**
     * look into current element and check if it is a potential match to a particular locator
     * @param {RecordingStep} eventTarget 
     */
    __findPotentialMatchForEvent(eventTarget) {
        /** @type {Array<Locator>} */
        let locatorLibrarySnapshot = JSON.parse(JSON.stringify(this.locatorManager.locatorLibrary))
        let eventSelector = eventTarget
        let potentialMatches = locatorLibrarySnapshot.filter(item => {
            return item.selector == eventSelector
        })

        return potentialMatches
    }




    /**
     * Based on the offset, update step sequence
    * @param {string} fromIndex 
    * @param {number} offset 
     */
    moveStepInArray(fromIndex, offset) {
        fromIndex = Number.parseInt(fromIndex)
        let toIndex = fromIndex + offset
        let arr = this.steps
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        this.steps = arr
    }
    /**
     * returns the picture path for current step
     */
    getHtmlPath() {
        let fileName = Date.now().toString() + ".html"
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }
    /**
     * returns the picture path for current step
     */
    getPicPath() {
        let fileName = Date.now().toString() + ".png"
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }


}

module.exports = { WorkflowRecord, RecordingStep, COMMAND_TYPE }