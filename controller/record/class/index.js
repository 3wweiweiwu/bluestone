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
var TYPES = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
    goto: 'goto'
}

/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'} command
 * @property {number} target
 * @property {number} parameter
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 */
class RecordingStep {
    /**     * 
     * @param {step} recordingStep 
     */
    constructor(recordingStep) {
        this.command = recordingStep.command
        this.target = recordingStep.target
        this.matchedSelector = recordingStep.matchedSelector
        this.parameter = recordingStep.parameter
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
        this.operationArguments = operationArguments
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
class WorkflowRecord {
    constructor() {
        this.name = ''
        /** @type {Array<recordingStep>} */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
        this.__isRecording = true
        this.ui = {
            spy: {
                browserSelection: {
                    currentSelector: '',
                    selectorPicture: '',
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
                            new Operation(WorkflowRecord.inbuiltOperation.textEqual, 'Text Equal', ['Please specify the text', 'this is a test'])
                        ]
                    },
                    waitTill: {
                        text: 'Wait Till',
                        operations: [
                            new Operation(WorkflowRecord.inbuiltOperation.itemVisible, 'Element Visible', ['wait time in seconds']),
                            new Operation(WorkflowRecord.inbuiltOperation.itemInvisible, 'Element Invisible', ['wait time in seconds'])
                        ]
                    },
                    customizedFunctions: {
                        text: 'Run Customized Function',
                        operations: []
                    }
                }

            }
        }

    }
    static inbuiltOperation = {

        textEqual: 'textEqual',
        itemVisible: 'itemVisible',
        itemInvisible: 'itemInvisible'

    }
    static inbuiltQueryKey = {
        currentGroup: 'currentGroup',
        currentOperation: 'currentOperation',
        currentArgument: 'currentArgument'
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
        return operation.operationArguments
    }
    getCurrentGroup() {
        if (this.ui.spy.userSelection.currentGroup == null || this.ui.spy.userSelection.currentGroup == '') {
            return ''
        }


        return this.ui.spy.group[this.ui.spy.userSelection.currentGroup]
    }


    //based on current selector info, return current selector we have
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
        queryKeys.forEach(key => {
            this.__updateUserInputForSpy(key, query[key])
        })
    }
    __updateUserInputForSpy(key, value) {
        switch (key) {
            case WorkflowRecord.inbuiltQueryKey.currentGroup:
                this.ui.spy.userSelection.currentGroup = value
                break;
            case WorkflowRecord.inbuiltQueryKey.currentOperation:
                this.ui.spy.userSelection.currentOperation = value
                break;
            default:
                break;
        }
    }

}

module.exports = { WorkflowRecord }