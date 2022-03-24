const { Locator } = require('../../locator/index')
const StepResult = require('../../mocha/class/StepResult')
const FunctionAST = require('../../ast/class/Function')
const HtmlCaptureStatus = require('./HtmlCaptureStatus')
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
        this.timeStamp = recordingStep.timestamp
        if (this.timeStamp == null) {
            this.timeStamp = recordingStep.timeStamp
        }
        this.scriptLineNumber = recordingStep.scriptLineNumber
        this.healingTree = recordingStep.healingTree
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
        this.__htmlPath = htmlCaptureRepo.getHtmlByPath(this.__htmlPath, offSet)

    }
}
/**
 * @typedef step
 * @property {'click'|'change'|'dblclick'|'keydown'|'goto'|'upload'|'waitForDownloadComplete'|'waitAndHandleForAlert'} command
 * @property {string} target
 * @property {Array<ExistingSelector>} matchedSelector
 * @property {number} timeoutMs
 * @property {string} htmlPath
 * @property {string} targetPicPath
 * @property {Array<string>} iframe
 * @property {import('../../ast/class/Function')} functionAst
 * @property {Array<RecordingStep>} potentialMatch
 * @property {Array<RecordingStep>} framePotentialMatch
 * @property {number} timestamp
 * @property {number} currentSelectedIndex
 * @property {number} scriptLineNumber
 * @property {string} healingTree
 */
module.exports = RecordingStep