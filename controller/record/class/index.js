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

    }
}
class WorkflowRecord {
    constructor() {
        this.name = ''
        /** @type {Array<recordingStep>} */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
    }
    /**
     * Add step into workflow record
     * @param {RecordingStep} step 
     */
    addStep(step) {
        step.timeoutMs = Date.now() - this.lastOperationTimestamp
        this.steps.push(step)
        this.lastOperationTimestamp = Date.now()
    }
}
module.exports = { RecordingStep, WorkflowRecord }