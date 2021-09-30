const path = require('path')
const config = require('../../../config')
const { LocatorManager, Locator } = require('../../locator/index')
const AstManager = require('../../ast')
const FunctionAST = require('../../ast/class/Function')
const JsDocTag = require('../../ast/class/JsDocTag')
const { testTextEqual } = require('../../../ptLibrary/functions/inbuiltFunc')
const _eval = require('eval')
const WorkflowPug = require('../../ui/class/Workflow')
const LocatorDefinerPug = require('../../ui/class/LocatorDefiner')
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
        //TODO: seperate Ui spy into another class
        this.puppeteer = puppeteer
        this.name = ''
        /** 
         * @type {Array<RecordingStep>} 
         */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
        this.__isRecording = true
        this.astManager = new AstManager(config.code.locatorPath)
        this.__locatorDefinerPug = new LocatorDefinerPug('', '', '', '', [])
        this.ui = {
            spy: {
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
                    lastOperationTimeoutMs: 0
                },
                userSelection: {
                    currentGroup: '',
                    currentOperation: '',
                    currentArgument: [],
                    currentLocatorIndex: -1,
                    currentLocatorPath: '',
                    currentLocatorName: '',
                    currentLocatorSelector: ''
                },
                group: {
                    customizedFunctions: {
                        text: 'Run Customzied Function',
                        operations: []
                    }
                },
                validation: {
                    btnAddStep: ''
                },
                visible: false,
                result: { isPass: null, text: '' },
                runCurrentOperation: true

            }
        }

        this.locatorManager = new LocatorManager(config.code.locatorPath)
        /**@type {WorkflowPug} */
        this.workflowPug = new WorkflowPug([])






    }
    get locatorDefinerPug() {
        return this.__locatorDefinerPug
    }
    /**
     * Initialize Locator Definer page based on information from current locator information
     * @param {string} defaultSelector 
     * @param {string} locatorHtmlPath 
     * @param {string} locatorName 
     * @param {string} locatorSelector 
     * @param {Array<Locator>} potentialMatch 
     * @param {number} stepIndex
     */
    async refreshLocatorDefiner(defaultSelector, locatorHtmlPath, locatorName, locatorSelector, potentialMatch, stepIndex) {
        //convert html path from local file to relative url
        let htmlUrl = this.convertLocalPath2RelativeLink(locatorHtmlPath)

        //create a new object because we are going to modify screenshot key direclty
        /** @type {Array<Locator>} */
        let newPotentialMatch = JSON.parse(JSON.stringify(potentialMatch))
        //copy over locator pictures to temp folder for visualization
        let bluestoneFuncFolder = path.dirname(this.locatorManager.locatorPath)
        for (let i = 0; i < newPotentialMatch.length; i++) {
            let item = newPotentialMatch[i]
            //no pic
            if (item.screenshot == null) {
                continue
            }
            let sourcePath = path.join(bluestoneFuncFolder, item.screenshot)
            let newPicPath = this.getPicPath()
            //check if file path is valid
            try {
                await fs.access(sourcePath);
                await fs.copyFile(sourcePath, newPicPath)

            } catch (err) {
                continue
            }
            newPotentialMatch[i].screenshot = this.getSpySelectorPictureForPug(newPicPath)
        }

        this.__locatorDefinerPug = new LocatorDefinerPug(defaultSelector, htmlUrl, locatorName, locatorSelector, newPotentialMatch, stepIndex)
    }
    static inBuiltFunc = {
        testTextEqual: 'testTextEqual',
        testElementVisible: 'testElementVisible',
        testElementInvisible: 'testElementInvisible',
        hoverMouse: 'hoverMouse'
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
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.hoverMouse)
                ]
            },
            customizedFunctions: {
                text: this.ui.spy.group.customizedFunctions.text,
                operations: []
            }
        }
        //populate customized function
        let customizedFunctions = activeFunctions.filter(item => {
            return !inBuiltFuncNames.includes(item.name)
        })
        groupInfo.customizedFunctions.operations = customizedFunctions
        this.ui.spy.group = groupInfo

    }
    get runCurrentOperation() {
        return this.ui.spy.runCurrentOperation
    }
    runCurrentOperation(willRun) {
        this.ui.spy.runCurrentOperation = willRun
    }
    /**
     * get active functions based on active elements on screen
     * @returns {Array<import('../../ast/class/Function')>}
     */
    getActiveCustomFunctions() {
        this.ui.spy.group.customizedFunctions.operations = []
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
        this.ui.spy.visible = isVisible
    }
    get spyVisible() {
        return this.ui.spy.visible
    }
    set spyBrowserSelectionPicPath(picturePath = '') {
        this.ui.spy.browserSelection.selectorPicture = picturePath
    }
    set spyBrowserSelectionHtmlPath(htmlPath = '') {
        this.ui.spy.browserSelection.selectorHtmlPath = htmlPath
    }
    static inbuiltOperation = {

        textEqual: 'testTextEqual',
        itemVisible: 'itemVisible',
        itemInvisible: 'itemInvisible',
        hover: 'hover'

    }
    static inbuiltId = {
        spy: 'bluestone_inbrowser_console'
    }
    static inbuiltQueryKey = {
        currentGroup: 'currentGroup',
        currentOperation: 'currentOperation',
        currentArgument: 'currentArgument',
        currentArgumentIndex: 'currentArgumentIndex',
        btnAddStep: 'btnAddStep',
        btnCancel: 'btnCancel',
        btnRun: 'btnRun'
    }
    static inbuiltEvent = {
        refresh: 'refresh'
    }
    /**
     * return a list of group info for the pug to consume 
     */
    getSpyGroupsInfoForPug() {
        let groupId = Object.keys(this.ui.spy.group)
        let groupInfo = groupId.map(id => {
            return new PugDropDownInfo(id, this.ui.spy.group[id].text, `spy?${WorkflowRecord.inbuiltQueryKey.currentGroup}=${id}`)
        })
        return groupInfo
    }
    /**
     * return a list of operation based on curent group
     * @returns 
     */
    getOperationInfoForPug() {
        let currentGroup = this.ui.spy.userSelection.currentGroup

        if (currentGroup == '') {
            return []
        }

        let operationInfo = this.ui.spy.group[currentGroup].operations.map(item => {
            return new PugDropDownInfo(item.name, item.description, `spy?${WorkflowRecord.inbuiltQueryKey.currentOperation}=${item.name}`)
        })

        return operationInfo


    }

    getArgumentsInfoForPug() {

        let operation = this.getCurrentOperation()
        if (operation == null) return []
        if (operation.params == null) {
            return []
        }
        let result = []
        //add pugType property for the UI input
        let uiIndex = 0
        let operationArguments = operation.params.reduce((previousValue, currentValue, currentIndex) => {
            let standardizedCurrentType = currentValue.type.name.toLowerCase()
            if (standardizedCurrentType == 'string') {
                currentValue['pugType'] = 'text'
                previousValue.push(currentValue)
                //if this is string for text equal, automatically populate value
                if (operation.name == WorkflowRecord.inbuiltOperation.textEqual) {
                    operation.params[currentIndex].value = this.ui.spy.browserSelection.currentInnerText
                }
                uiIndex++
            }
            else if (standardizedCurrentType == 'number') {
                currentValue['pugType'] = 'number'
                previousValue.push(currentValue)
                uiIndex++
            }
            else {
                console.log()
                //mark params value to be page/browser/element
            }
            return previousValue
        }, [])
        return operationArguments
    }
    getCurrentGroup() {
        if (this.ui.spy.userSelection.currentGroup == null || this.ui.spy.userSelection.currentGroup == '') {
            return ''
        }


        return this.ui.spy.group[this.ui.spy.userSelection.currentGroup]
    }
    /**
     * Set Last operation time
     */
    setLastOperationTime() {
        this.ui.spy.browserSelection.lastOperationTime = Date.now()
    }

    /**
     *  based on current selector info, return current selector we have 
     * @returns {FunctionAST}
     */
    getCurrentOperation() {
        //check group info
        if (this.ui.spy.userSelection.currentGroup == null || this.ui.spy.userSelection.currentGroup == '') {
            return ''
        }
        //check operation info
        if (this.ui.spy.userSelection.currentOperation == null || this.ui.spy.userSelection.currentOperation == '') {
            return ''
        }

        let operationInfo = this.ui.spy.group[this.ui.spy.userSelection.currentGroup].operations.find(item => {
            return item.name == this.ui.spy.userSelection.currentOperation
        })
        return operationInfo
    }
    getCurrentGroupText() {
        let current = this.getCurrentGroup()
        let text = ''
        if (current != null) {
            text = current.text
        }
        return text
    }
    getCurrentOperationText() {
        let current = this.getCurrentOperation()
        let text = ''
        if (current != null) {
            text = current.description
        }
        return text
    }
    set isRecording(recordStatus) {
        this.__isRecording = recordStatus
    }
    get isRecording() {
        return this.__isRecording
    }
    /**
     * add current event to the list
     * @param {RecordingStep} event 
     */
    addStep(event) {
        //TODO: handle change event, it should give us data
        event.potentialMatch = this.__findPotentialMatchForEvent(event.target)
        this.steps.push(event)
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
     * Based on req.query and update the variable
     * @param {*} query 
     * @returns 
     */
    async updateUserInputForSpy(query) {
        let queryKeys = Object.keys(query)
        //if there is no query, we will just return
        if (queryKeys.length == 0) {
            return
        }
        //handle update for current group and current operation
        if (queryKeys.length >= 1) {
            let key = queryKeys[0]
            await this.__updateUserInputForSpy(key, query[key])
        }
        //handle update for arguments
        if (queryKeys.includes(WorkflowRecord.inbuiltQueryKey.currentArgument) && queryKeys.includes(WorkflowRecord.inbuiltQueryKey.currentArgumentIndex)) {
            //update ui value
            let currentArgumentIndex = query[WorkflowRecord.inbuiltQueryKey.currentArgumentIndex]
            let currentQueryKeyForValue = query[WorkflowRecord.inbuiltQueryKey.currentArgument]
            let currentFunction = this.getCurrentOperation()
            let argIndex = this.__convertUIIndex2ArgumentIndex(currentArgumentIndex, currentFunction)
            currentFunction.params[argIndex].value = currentQueryKeyForValue

            //update user selection value
            this.ui.spy.userSelection.currentArgument[currentArgumentIndex] = currentQueryKeyForValue
        }
        this.locatorDefinerPug.update(query)
        this.workflowPug.update(query)

    }
    /**
     * Convert UI Index to actual argument index
     * @param {number} uiIndex 
     * @param {FunctionAST} operation 
     */
    __convertUIIndex2ArgumentIndex(uiIndex, operation) {
        let qualifiedArgCounter = -1
        let convertedIndex = 0
        for (let i = 0; i < operation.params.length + 1; i++) {
            let typeName = operation.params[i].type.name.toLowerCase()
            if (typeName == 'number' || typeName == 'string') {
                qualifiedArgCounter++
            }
            if (qualifiedArgCounter == uiIndex) {
                convertedIndex = i
                break
            }
        }
        return convertedIndex

    }
    /**
     * This is place where we handle single query call for the ui input
     * @param {string} key 
     * @param {string} value 
     */
    async __updateUserInputForSpy(key, value) {
        let targetStep, stepIndex
        switch (key) {
            case WorkflowRecord.inbuiltQueryKey.currentGroup:
                this.ui.spy.userSelection.currentGroup = value
                break;
            case WorkflowRecord.inbuiltQueryKey.currentOperation:
                this.ui.spy.userSelection.currentOperation = value
                this.ui.spy.userSelection.currentArgument = this.getCurrentOperation().params.map(argument => {
                    return argument.description
                })
                break;
            case WorkflowRecord.inbuiltQueryKey.btnAddStep:
                this.__validateOverallFormForSpy()
                //if validation is done correctly, add current operation
                if (this.ui.spy.validation.btnAddStep == '') {
                    let currentOperation = this.getCurrentOperation()
                    let command = currentOperation.name
                    let target = this.ui.spy.browserSelection.currentSelector
                    let targetInnerText = this.ui.spy.browserSelection.currentInnerText
                    let targetPicPath = this.ui.spy.browserSelection.selectorPicture
                    let timeoutMs = this.ui.spy.browserSelection.lastOperationTimeoutMs
                    let htmlPath = this.ui.spy.browserSelection.selectorHtmlPath
                    let step = new RecordingStep({ command, target, timeoutMs, targetPicPath, targetInnerText, functionAst: currentOperation, htmlPath: htmlPath })
                    this.addStep(step)
                    console.log(this.steps)
                }
                break;
            case WorkflowRecord.inbuiltQueryKey.btnCancel:
                this.isRecording = true
                this.spyVisible = false

                break;
            case WorkflowRecord.inbuiltQueryKey.btnRun:
                this.runCurrentOperation = true
                break;
            case WorkflowPug.inBuiltQueryKey.btnRemoveWorkflowStep:
                this.steps.splice(value, 1)
                break
            case WorkflowPug.inBuiltQueryKey.btnMoveWorkflowUp:
                this.__moveItemInArray(value, -1)
                break
            case WorkflowPug.inBuiltQueryKey.btnMoveWorkflowDown:
                this.__moveItemInArray(value, 1)
                break
            case WorkflowPug.inBuiltQueryKey.btnEditWorkflow:
                targetStep = this.steps[value]
                this.__repopulateOperationUI(targetStep)
                break
            case WorkflowPug.inBuiltQueryKey.btnLocatorWorkflow:
                stepIndex = Number.parseInt(value)
                targetStep = this.steps[stepIndex]
                await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex)
                break
            case WorkflowPug.inBuiltQueryKey.btnResolveLocatorQueryKey:
                //automatically match all existing selectors
                this.steps.forEach(item => {
                    if (item.potentialMatch.length == 1) {
                        item.finalLocatorName = item.potentialMatch[0].Locator
                        item.finalLocator = item.potentialMatch[0].path
                    }
                })

                //find out selector that is pending correlaton
                stepIndex = this.steps.findIndex(item => {
                    return item.finalLocator == '' || item.finalLocator == ''
                })
                if (stepIndex != -1) {
                    targetStep = this.steps[stepIndex]
                    await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex)
                }


                //update text info
                this.workflowPug.validateForm(this.steps)
                break
            case LocatorDefinerPug.inBuiltQueryKey.btnConfirm:
                //check locator and confirm locator input
                let locatorCheckResult = await this.puppeteer.checkLocatorInDefiner(this.locatorDefinerPug.defaultSelector, this.locatorDefinerPug.locatorSelector)
                let finalSelection = this.locatorDefinerPug.getFinalSelection(locatorCheckResult)


                //check all steps and replicate same setting for same locator
                this.steps.forEach(item => {
                    if (item.target == this.locatorDefinerPug.defaultSelector) {
                        item.finalLocator = finalSelection.finalLocator
                        item.finalLocatorName = finalSelection.finalLocatorName
                    }
                })

                this.workflowPug.validateForm(this.steps)
                break
            case WorkflowPug.inBuiltQueryKey.btnCreateTestcaseQueryKey:
                if (this.workflowPug.validateForm(this.steps)) {
                    //TODO: output code to file
                }
                break
            default:
                break;
        }
    }
    /**
     * Based on the current step, repopulate UI
     * @param {RecordingStep} step 
     */
    __repopulateOperationUI(step) {

        let currentGroupKeys = Object.keys(this.ui.spy.group)
        let findOperation = false
        for (let i = 0; i < currentGroupKeys.length; i++) {
            let groupKey = currentGroupKeys[i]
            /** @type {Array<FunctionAST>} */
            let operations = this.ui.spy.group[groupKey].operations
            let currentOperation = operations.find(item => {
                if (item == null) return false
                return item.name == step.command
            })

            if (currentOperation != null) {
                this.ui.spy.userSelection.currentGroup = groupKey
                this.ui.spy.userSelection.currentOperation = step.functionAst.name
                this.ui.spy.browserSelection.currentInnerText = step.targetInnerText
                this.ui.spy.browserSelection.currentSelector = step.target
                this.ui.spy.browserSelection.selectorPicture = step.targetPicPath
                this.ui.spy.browserSelection.lastOperationTimeoutMs = step.timeoutMs
                findOperation = true
                break
            }

        }
        if (!findOperation) {
            this.ui.spy.result.isPass = false
            this.ui.spy.result.text = `Unable to find function ${step.command}`
        }
    }
    /**
     * Based on the offset, update step sequence
    * @param {string} fromIndex 
    * @param {number} offset 
     */
    __moveItemInArray(fromIndex, offset) {
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
     * Validate current ui and see if all elements has been popoulated
     * If all elements have been populated, this.ui.spy.validation.btnAddStep will equal to ''
     * Otherwise, it will save validation error in this.ui.spy.validation.btnAddStep
     * @returns 
     */
    __validateOverallFormForSpy() {

        this.ui.spy.validation.btnAddStep = ''
        //check group info
        if (this.ui.spy.userSelection.currentGroup == null || this.ui.spy.userSelection.currentGroup == '') {
            this.ui.spy.validation.btnAddStep = `Please input group info`
            return
        }

        //check operation info
        if (this.ui.spy.userSelection.currentOperation == null || this.ui.spy.userSelection.currentOperation == '') {
            this.ui.spy.validation.btnAddStep = `Please input operation info`
            return
        }
        //all argument need to be populated
        let currentOperation = this.getCurrentOperation()
        let emptyArgumentIndex = currentOperation.params.findIndex(item => {
            //find out empty argument only for string and number input becasue we won't take any other input type here
            return (item.type.name == 'string' || item.type.name == 'number') && (item.value == null || item.value == '')
        })
        if (emptyArgumentIndex != -1 && this.getCurrentOperation().name != WorkflowRecord.inBuiltFunc.testTextEqual) {
            this.ui.spy.validation.btnAddStep = `Please enter value for argument`
            return
        }


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
    getSpySelectorPictureForPug(picturePath = this.ui.spy.browserSelection.selectorPicture) {
        let pictureName = path.basename(picturePath)
        return pictureName
    }
    /**
     * Create Info for workflow
     */
    getWorkflowForPug() {
        this.workflowPug.refreshWorkflowForPug(this.steps)


        return {
            header: this.workflowPug.workflowHeader,
            info: this.workflowPug.workflowSteps
        }
    }
}

module.exports = { WorkflowRecord, RecordingStep, COMMAND_TYPE }