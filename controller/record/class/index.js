const path = require('path')
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

/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'} command
 * @property {string} target
 * @property {number} parameter
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 * @property {string} targetInnerText
 * @property {string} targetPicPath
 */
class RecordingStep {
    /**     * 
     * @param {step} recordingStep 
     */
    constructor(recordingStep) {
        this.command = recordingStep.command
        this.target = recordingStep.target
        this.matchedSelectors = recordingStep.matchedSelector
        this.parameter = recordingStep.parameter
        this.targetInnerText = recordingStep.targetInnerText
        this.targetPicPath = recordingStep.targetPicPath
        this.meta = {}
    }
}
/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'} command
 * @property {number} target
 * @property {number} parameter
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 */


class ArgummentInfo {
    /**
     * @param {string} argumentValue
     * @param {string} argumentText
     */
    constructor(argumentText, argumentValue) {
        this.text = argumentText
        this.value = argumentValue
    }
}
class Operation {
    /**
     * Create a new opeartion
     * @param {string} operationId 
     * @param {string} operationName 
     * @param {Array<string>} operationArguments 
     */
    constructor(operationId, operationName, operationArguments) {
        this.argument = ''
        this.text = operationName
        if (operationArguments == null) operationArguments = []
        /**
         * @type {Array<ArgummentInfo>}
         */
        this.operationArguments = operationArguments.map(argumentText => { return new ArgummentInfo(argumentText, '') })

        this.operationId = operationId
    }
}
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
    constructor() {
        this.name = ''
        /** 
         * @type {Array<RecordingStep>} 
         */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
        this.__isRecording = true
        this.ui = {
            spy: {
                browserSelection: {
                    currentSelector: '',
                    selectorPicture: '',
                    currentInnerText: 'default',
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                },
                userSelection: {
                    currentGroup: '',
                    currentOperation: '',
                    currentArgument: [],
                },
                group: {
                    assert: {
                        text: 'Verify',
                        operations: [
                            new Operation(WorkflowRecord.inbuiltOperation.textEqual, 'Text Equal', ['Please specify the text'])
                            // TODO: add a way to check input number or text
                        ]
                    },
                    waitTill: {
                        text: 'Wait Till',
                        operations: [
                            new Operation(WorkflowRecord.inbuiltOperation.itemVisible, 'Element Visible', ['wait time in seconds']),
                            new Operation(WorkflowRecord.inbuiltOperation.itemInvisible, 'Element Invisible', ['wait time in seconds'])
                        ]
                    },
                    inbuiltFunction: {
                        text: 'Run In-built function',
                        operations: [
                            new Operation(WorkflowRecord.inbuiltOperation.hover, 'Hover over current element', []),
                        ]
                    },
                    customizedFunctions: {
                        text: 'Run Customized Function',
                        operations: []
                    }
                },
                validation: {
                    btnAddStep: ''
                }

            }
        }

    }
    set spyBrowserSelectionPicPath(picturePath = '') {
        this.ui.spy.browserSelection.selectorPicture = picturePath
    }
    static inbuiltOperation = {

        textEqual: 'textEqual',
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
        btnCancel: 'btnCancel'
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
            return new PugDropDownInfo(item.operationId, item.text, `spy?${WorkflowRecord.inbuiltQueryKey.currentOperation}=${item.operationId}`)
        })

        return operationInfo


    }

    getArgumentsInfoForPug() {

        let operation = this.getCurrentOperation()
        if (operation == null) return []
        if (operation.operationArguments == null) {
            return []
        }

        //if operation is equal, we should automatically populate the argument based on the inner text of current value
        if (operation.operationId == WorkflowRecord.inbuiltOperation.textEqual) {
            operation.operationArguments[0].value = this.ui.spy.browserSelection.currentInnerText
            this.ui.spy.userSelection.currentArgument[0] = this.ui.spy.browserSelection.currentInnerText
        }
        return operation.operationArguments
    }
    getCurrentGroup() {
        if (this.ui.spy.userSelection.currentGroup == null || this.ui.spy.userSelection.currentGroup == '') {
            return ''
        }


        return this.ui.spy.group[this.ui.spy.userSelection.currentGroup]
    }


    /**
     *  based on current selector info, return current selector we have 
     * @returns {Operation}
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
            return item.operationId == this.ui.spy.userSelection.currentOperation
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
            text = current.text
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
        this.steps.push(event)
    }
    /**
     * Based on req.query and update the variable
     * @param {*} query 
     * @returns 
     */
    updateUserInputForSpy(query) {
        let queryKeys = Object.keys(query)
        //if there is no query, we will just return
        if (queryKeys.length == 0) {
            return
        }
        //handle update for current group and current operation
        if (queryKeys.length == 1) {
            let key = queryKeys[0]
            this.__updateUserInputForSpy(key, query[key])
        }
        //handle update for arguments
        if (queryKeys.includes(WorkflowRecord.inbuiltQueryKey.currentArgument) && queryKeys.includes(WorkflowRecord.inbuiltQueryKey.currentArgumentIndex)) {
            //update ui value
            let currentArgumentIndex = query[WorkflowRecord.inbuiltQueryKey.currentArgumentIndex]
            let currentQueryKeyForValue = query[WorkflowRecord.inbuiltQueryKey.currentArgument]
            this.getCurrentOperation().operationArguments[currentArgumentIndex].value = currentQueryKeyForValue
            //update user selection value
            this.ui.spy.userSelection.currentArgument[currentArgumentIndex] = currentQueryKeyForValue
        }

    }
    /**
     * This is place where we handle single query call for the ui input
     * @param {string} key 
     * @param {string} value 
     */
    __updateUserInputForSpy(key, value) {
        switch (key) {
            case WorkflowRecord.inbuiltQueryKey.currentGroup:
                this.ui.spy.userSelection.currentGroup = value
                break;
            case WorkflowRecord.inbuiltQueryKey.currentOperation:
                this.ui.spy.userSelection.currentOperation = value
                this.ui.spy.userSelection.currentArgument = this.getCurrentOperation().operationArguments.map(argument => {
                    return argument.value
                })
                break;
            case WorkflowRecord.inbuiltQueryKey.btnAddStep:
                this.__validateOverallFormForSpy()
                break;
            case WorkflowRecord.inbuiltQueryKey.btnCancel:
                this.isRecording = true
                break;
            default:
                break;
        }
    }
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
        let emptyArgumentIndex = this.ui.spy.userSelection.currentArgument.findIndex(item => {
            return item == null || item == ''
        })
        if (emptyArgumentIndex != -1) {
            this.ui.spy.validation.btnAddStep = `Please enter value for argument #${emptyArgumentIndex}`
            return
        }

        if (this.ui.spy.validation.btnAddStep == '') {
            //TODO: add step to the record
            return
        }
    }
    /**
     * returns the picture path for current step
     */
    getPicPath() {
        let fileName = Date.now().toString() + ".png"
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }
    getSpySelectorPictureForPug() {
        let pictureName = path.basename(this.ui.spy.browserSelection.selectorPicture)
        return pictureName
    }
}

module.exports = { WorkflowRecord, RecordingStep, COMMAND_TYPE }