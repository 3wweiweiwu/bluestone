const path = require('path')
const config = require('../../../config')
const { LocatorManager, Locator } = require('../../locator/index')
const AstManager = require('../../ast')
const FunctionAST = require('../../ast/class/Function')
const JsDocTag = require('../../ast/class/JsDocTag')
const { testTextEqual } = require('../../../ptLibrary/functions/inbuiltFunc')
const _eval = require('eval')

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

class PugDropDownInfo {
    /**
     * Return group info for the pug
     * @param {string} id 
     * @param {string} text 
     */
    constructor(id, text, url) {
        this.id = id
        this.text = text
        this.url = url
    }
}
class PugTextInputInfo {
    constructor(id, text, url) {
        this.id = id
        this.text = text
        this.url = url
    }
}
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
        await this.refreshActiveFunc()


        this.setLastOperationTime()
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
     * Based on the current element that is selected in in-browser spy, run function and output result to the validate view
     */
    __runCurrentFunc() {
        let currentOperation = this.getCurrentOperation()

        eval()
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