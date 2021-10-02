const path = require("path")
const { WorkflowRecord, RecordingStep } = require('../../record/class')
class WorkflowStepForPug {
    constructor(command, target, argDic) {
        this.command = command
        this.target = target
        this.argument = JSON.stringify(argDic)
    }
    /**
     * Generate Pug-compatible array format
     * @returns {Array<string>}
     */

    generatePugOutput() {
        return [this.command, this.target, this.argument]
    }
}

class WorkFlowPug {

    static inBuiltQueryKey = {
        btnRemoveWorkflowStep: 'REMOVE_WRKFLOW',
        btnMoveWorkflowUp: 'WRKFLOW_UP',
        btnMoveWorkflowDown: 'WRKFLOW_DOWN',
        btnEditWorkflow: 'EDIT_WRKFLOW',
        btnLocatorWorkflow: 'EDIT_LOCATOR',
        btnResolveLocatorQueryKey: 'WORKFLOW_RESOLVE',
        btnCreateTestcaseQueryKey: 'WORKFLOW_CREATE_TC',
        txtTestSuiteQueryKey: 'WORKFLOW_TEST_SUITE',
        txtTestCaseQueryKey: 'WORKFLOW_TEST_CASE'
    }
    /**
     * 
     * @param {Array<import('../../record/class/index').RecordingStep>} steps 
     * @param {WorkflowRecord} backend
     */
    constructor(steps, backend) {
        this.workflowHeader = ['Operation', 'Target', 'Arguments', 'Actions']
        /** @type {List<WorkflowStepForPug>} */
        this.workflowSteps = null
        this.refreshWorkflowForPug(steps)
        this.textTestSuiteValue = ''
        this.textTestCaseValue = ''
        this.txtValidationStatus = ''
        this.textFileName = ''
        this.backend = backend
    }
    /**
     * Create UI info for workflow
     */
    getWorkflowForPug() {
        this.refreshWorkflowForPug(this.backend.steps)


        return {
            header: this.workflowHeader,
            info: this.workflowSteps
        }
    }
    /**
     * 
     * @param {*} steps 
     * @returns 
     */
    refreshWorkflowForPug(steps) {
        let workflowInfo = steps.map(step => {
            let argStr = ''
            if (step.functionAst != null) {
                let currentOperation = step.functionAst.generateArgumentNContext()
                argStr = currentOperation.argDic
            }
            let target = step.target
            if (step.targetPicPath) {
                target = path.basename(step.targetPicPath)
            }
            let workflowPug = new WorkflowStepForPug(step.command, target, argStr)
            let workflowPugArray = workflowPug.generatePugOutput()
            return workflowPugArray
        })
        this.workflowSteps = workflowInfo
    }
    //based on the query,update front-end data structure
    async update(query) {
        let queryKeys = Object.keys(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        let stepIndex = -1
        /**@type {RecordingStep} */
        let targetStep = null

        switch (firstKey) {
            case WorkFlowPug.inBuiltQueryKey.btnRemoveWorkflowStep:
                this.backend.steps.splice(firstValue, 1)

                break
            case WorkFlowPug.inBuiltQueryKey.btnMoveWorkflowUp:
                this.backend.moveStepInArray(firstValue, -1)

                break
            case WorkFlowPug.inBuiltQueryKey.btnMoveWorkflowDown:
                this.backend.moveStepInArray(firstValue, 1)
                break
            //TODO: This require integration with locator definer
            case WorkFlowPug.inBuiltQueryKey.btnLocatorWorkflow:
                stepIndex = Number.parseInt(firstValue)
                targetStep = this.backend.steps[stepIndex]
                // await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex)
                break
            case WorkFlowPug.inBuiltQueryKey.btnResolveLocatorQueryKey:
                //automatically match all existing selectors
                this.backend.steps.forEach(item => {
                    if (item.potentialMatch.length == 1) {
                        item.finalLocatorName = item.potentialMatch[0].Locator
                        item.finalLocator = item.potentialMatch[0].path
                    }
                })

                //find out selector that is pending correlaton
                stepIndex = this.backend.steps.findIndex(item => {
                    return item.finalLocator == '' || item.finalLocator == ''
                })
                if (stepIndex != -1) {
                    targetStep = this.backend.steps[stepIndex]
                    await this.refreshLocatorDefiner(targetStep.target, targetStep.htmlPath, targetStep.finalLocatorName, targetStep.finalLocator, targetStep.potentialMatch, stepIndex)
                }
                //update text info
                this.validateForm(this.backend.steps)
                break
            case WorkFlowPug.inBuiltQueryKey.txtTestSuiteQueryKey:
                this.textTestSuiteValue = firstValue
                break
            case WorkFlowPug.inBuiltQueryKey.txtTestCaseQueryKey:
                this.textTestCaseValue = firstValue
                break
            default:
                break;
        }
    }
    /**
     * Genereate validaton action based on the current validation. If return true, it means no issue is found in current form
     * @param {Array<import('../../record/class/index').RecordingStep>} steps 
     * @param {boolean}
     */
    validateForm(steps) {
        this.txtValidationStatus = ''
        if (this.textTestSuiteValue == '') {
            this.txtValidationStatus = 'Please enter test suite name'
            return false
        }
        if (this.textTestCaseValue == '') {
            this.txtValidationStatus = 'Please enter test case name'
            return false
        }

        for (let i = 0; i < steps.length; i++) {
            let stepInfo = steps[i]
            if (stepInfo.finalLocator == '' || stepInfo.finalLocatorName == '') {
                this.txtValidationStatus = `Please correlate locator at step ${i}`
                return false
            }
        }

        return true
    }
}

module.exports = WorkFlowPug