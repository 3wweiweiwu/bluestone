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
const HtmlCaptureStatus = require('./HtmlCaptureStatus')
const Testcase = require('../../coder/class/Testcase')
const Navigation = require('../class/NavigationStatus')
const PicCapture = require('../class/PicCapture')
const ptConstant = require('../../../ptLibrary/functions/inbuiltFunc').VAR
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
        /** @type {Array<string>} */
        this.iframe = recordingStep.iframe
        if (typeof (recordingStep.iframe) == 'string') {
            this.iframe = JSON.parse(recordingStep.iframe)
        }

        /** @type {Array<Locator>} */
        this.potentialMatch = recordingStep.potentialMatch
        this.framePotentialMatch = recordingStep.framePotentialMatch
        this.__htmlPath = recordingStep.htmlPath
        this.targetInnerText = recordingStep.targetInnerText
        this.targetPicPath = recordingStep.targetPicPath
        this.timeoutMs = recordingStep.timeoutMs
        this.meta = {}

        this.finalLocatorName = ''
        if (recordingStep.finalLocatorName) {
            this.finalLocatorName = recordingStep.finalLocatorName
        }
        this.finalLocator = ['']
        if (recordingStep.finalLocator) {
            this.finalLocator = recordingStep.finalLocator
        }
        this.functionAst = recordingStep.functionAst
        if (this.functionAst) {
            this.parameter = JSON.parse(JSON.stringify(recordingStep.functionAst.params))
        }
        this.result = new StepResult()


    }
    /**
     * //based on the searalized json file, re-create object
     * @param {object} json 
     * @param {FunctionAST} functionAst 
     * @param {string} command 
     * @returns {RecordingStep}
     */
    static restore(json, functionAst, command) {
        let result = new RecordingStep(json)
        let keys = Object.keys(json)
        keys.forEach(key => {
            result[key] = json[key]
        })
        result.functionAst = functionAst
        result.command = command
        return result
    }
    get htmlPath() {
        return this.__htmlPath
    }
    set htmlPath(path) {
        this.__htmlPath = path
    }
    setFinalLocator(finalLocatorName, finalLocator) {
        this.finalLocatorName = finalLocatorName
        this.finalLocator = finalLocator
    }
    /**
     * Update the html capture and change its index based on its location in htmlCapture repo
     * @param {Number} offSet 
     * @param {HtmlCaptureStatus} htmlCaptureRepo 
     */
    updateHtmlForStep(offSet, htmlCaptureRepo) {
        //get an rough estimate on where current html come from
        let currentIndex = htmlCaptureRepo.__queue.findIndex(item => { return item.outputPath.includes(this.__htmlPath) || item.path == this.__htmlPath })
        if (currentIndex == -1) {
            throw 'Unable to find current html in the html repo'
        }

        let updatedIndex = currentIndex
        //find next/previous element that is different from current picture
        do {
            updatedIndex = updatedIndex + offSet


            //updated index reach maximum limit
            if (updatedIndex < 0) {
                updatedIndex = 0
                break
            }
            //updated index reach minimum limit
            if (updatedIndex >= htmlCaptureRepo.__queue.length) {
                updatedIndex = htmlCaptureRepo.__queue.length - 1
                break
            }

            //the element in the updated index is different from current picture
            let updatedHtml = htmlCaptureRepo.__queue[updatedIndex]
            if (updatedHtml.path != this.__htmlPath && !updatedHtml.outputPath.includes(this.__htmlPath)) {
                break
            }

        }
        while (true)

        this.__htmlPath = htmlCaptureRepo.__queue[updatedIndex].path

    }
}
/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'} command
 * @property {string} target
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 * @property {string} htmlPath
 * @property {string} targetPicPath
 * @property {Array<string>} iframe
 * @property {import('../../ast/class/Function')} functionAst
 * @property {Array<RecordingStep>} potentialMatch
 * @property {Array<RecordingStep>} framePotentialMatch
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
        this.__isNavigationPending = false
        this.operationGroup = {
            customizedFunctions: {
                text: 'Run Customzied Function',
                operations: []
            }
        }
        this.navigation = new Navigation()
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
                parentIframe: [],
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lastOperationTime: Date.now(),
                lastOperationTimeoutMs: 0,
                currentOpeartion: null,
                __htmlCaptureInProcess: [],
                potentialMatch: [],
                framePotentialMatch: []
            },
        }
        this.picCapture = new PicCapture()
        this.htmlCaptureStatus = new HtmlCaptureStatus()
        this.locatorManager = new LocatorManager(config.code.locatorPath)
        this.inbuiltFuncPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        this.astManager.loadFunctions(config.code.funcPath)
        this.astManager.loadFunctions(this.inbuiltFuncPath)
    }
    get isNavigationPending() {
        return this.__isNavigationPending
    }
    set isNavigationPending(isPending) {
        this.__isNavigationPending = isPending
    }
    getCurrentOperation() {
        return this.operation.browserSelection.currentOpeartion
    }
    /**
     * Write Testcase code into script output folder and update bluestone-locator.js 
     * @param {string} testSuite 
     * @param {string} testCase 
     * @returns {string} output path
     */
    async writeCodeToDisk(testSuite, testCase) {
        //write code to disk
        let functionAstList = this.getAllFunctionAst()
        let coder = new Testcase(functionAstList, config.code.locatorPath, config.code.funcPath, config.code.configPath, config.code.scriptFolder, config.code.inbuiltFuncPath)
        coder.testSuite = testSuite
        coder.testCase = testCase
        let finalPath = await coder.writeCodeToDisk()

        //update locator
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i]
            //ignore locator for goto functon
            if (step.command == WorkflowRecord.inBuiltFunc.goto) continue

            //update step information accordingly
            let newLocator = await this.locatorManager.updateLocator(step.finalLocatorName, step.finalLocator, step.targetPicPath)

            //if it is a new locator, add the newly created locator to possible match
            if (newLocator) {
                newLocator.screenshot = path.basename(step.targetPicPath)
                this.steps.forEach(item => {
                    if (item.finalLocatorName == step.finalLocatorName) {
                        item.potentialMatch.push(newLocator)
                    }
                })
            }

        }
        //output locator to disk
        await this.locatorManager.outputLocatorToDisk()

        return finalPath
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
        hover: 'hover',
        waitElementVisible: 'waitElementVisible',
        testElementInvisible: 'testElementInvisible',
        waitElementExists: 'waitElementExists',
        hoverMouse: 'hoverMouse',
        change: 'change',
        click: 'click',
        goto: 'goto',
        keydown: 'keydown',
        gotoFrame: 'gotoFrame'
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
            WorkflowRecord.inBuiltFunc.waitElementVisible,
            WorkflowRecord.inBuiltFunc.testElementInvisible,
            WorkflowRecord.inBuiltFunc.hoverMouse
        ]
        //populate default list
        let groupInfo = {
            assert: {
                text: 'Verify',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.testTextEqual),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitElementExists),
                ]
            },
            waitTill: {
                text: 'Wait Till',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitElementVisible)
                ]
            },
            inbuiltFunction: {
                text: 'Run In-built function',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.change),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.goto),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.click),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.keydown),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.hover),
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
    __addSwitchIframeForStep(step) {
        let gotoFrameCommand = WorkflowRecord.inBuiltFunc.gotoFrame
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != gotoFrameCommand && step.iframe != null) {
            let switchToFrameAst = this.astManager.getFunction(gotoFrameCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            waitStep = RecordingStep.restore(waitStep, switchToFrameAst, gotoFrameCommand)

            //for iframe, its parent iframe will be its parent and its locator should be last xpath
            let parentIframe = step.iframe.slice(0, step.iframe.length - 1)
            let currentIframe = step.iframe[step.iframe.length - 1]
            waitStep.target = currentIframe
            if (currentIframe == null) {
                waitStep.target = ptConstant.parentIFrameLocator
            }
            waitStep.iframe = parentIframe
            waitStep.potentialMatch = step.framePotentialMatch

            this.steps.push(waitStep)
        }
    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     */
    __addWaitForFrame(step) {
        let waitCommand = WorkflowRecord.inBuiltFunc.waitElementExists
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != waitCommand && step.timeoutMs != 0 && step.iframe != null) {
            let waitFunctionAst = this.astManager.getFunction(waitCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            waitStep.target = waitStep.iframe
            waitStep = RecordingStep.restore(waitStep, waitFunctionAst, waitCommand)
            //hard code wait time param here
            waitStep.functionAst.params[2].value = step.timeoutMs
            this.steps.push(waitStep)
        }

    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     *  @param {boolean} isFrame the operation step
     */
    __addWaitForSteps(step, isFrame = false) {
        let waitCommand = 'waitElementExists'
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != waitCommand && step.timeoutMs != 0) {
            let waitFunctionAst = this.astManager.getFunction(waitCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            if (isFrame) {
                //for iframe, its parent iframe will be its parent and its locator should be last xpath
                waitStep.potentialMatch = step.framePotentialMatch
                let parentIframe = step.iframe.slice(0, step.iframe.length - 1)
                let currentIframe = step.iframe[step.iframe.length - 1]
                waitStep.target = currentIframe
                if (currentIframe == null) {
                    waitStep.target = ptConstant.parentIFrameLocator
                }
                waitStep.iframe = parentIframe
            }
            waitStep = RecordingStep.restore(waitStep, waitFunctionAst, waitCommand)
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
            if (item.target == ptConstant.parentIFrameLocator) {
                //if we are working with parent frame, we will search through locator library to find potential match
                //find if we have defined parent iframe in the past
                let parentFrame = this.locatorManager.locatorLibrary.find(item => { return item.Locator.includes(ptConstant.parentIFrameLocator) })
                if (parentFrame) {
                    item.potentialMatch = [JSON.parse(JSON.stringify(parentFrame))]

                }

            }
            if (item.potentialMatch.length == 1 && item.finalLocator.length == 1 && item.finalLocator[0] == '') {
                item.finalLocatorName = item.potentialMatch[0].path
                item.finalLocator = item.potentialMatch[0].Locator
                //update ElementSelector in the param
                let elementSelectorParam = item.functionAst.params.find(item => { return item.type.name == 'ElementSelector' })
                if (elementSelectorParam) {
                    elementSelectorParam.value = item.finalLocatorName
                }

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
     * Return all functionAst object for ast purpose
     */
    getAllFunctionAst() {
        let result = []
        this.steps.forEach(item => {
            result.push(item.functionAst)
        })
        return result
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

            let result = await this.puppeteer.runCurrentStep(step.functionAst, elementSelector, step.iframe)
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
        //handle change in iframe
        let lastStep = this.steps[this.steps.length - 1]
        if (lastStep != null && JSON.stringify(event.iframe) != JSON.stringify(lastStep.iframe)) {
            this.__addWaitForSteps(event, true)
            this.__addSwitchIframeForStep(event)
        }



        this.__addWaitForSteps(event, false)

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
        if (this.steps.length > 3 && step.command == 'change' && this.steps[this.steps.length - 3].command == 'keydown' && step.target == this.steps[this.steps.length - 3].target) {
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
            return item.selector == eventSelector && item.selector != ''
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
    getHtmlPath(fileName = null) {
        if (fileName == null) {
            fileName = Date.now().toString() + ".html"
        }
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }
    /**
     * returns the picture path for current step
     */
    getPicPath(fileName = null) {
        if (fileName == null) {
            fileName = Date.now().toString() + ".png"
        }

        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }


}

module.exports = { WorkflowRecord, RecordingStep, COMMAND_TYPE }