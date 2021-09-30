const path = require("path")
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

    //TODO: Add a button: resolve unmatched locator. 
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
     */
    constructor(steps) {
        this.workflowHeader = ['Operation', 'Target', 'Arguments', 'Actions']
        /** @type {List<WorkflowStepForPug>} */
        this.workflowSteps = null
        this.refreshWorkflowForPug(steps)
        this.textTestSuiteValue = ''
        this.textTestCaseValue = ''
        this.txtValidationStatus = ''
        this.textFileName = ''
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
    update(query) {
        let queryKeys = Object.keys(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        switch (firstKey) {

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