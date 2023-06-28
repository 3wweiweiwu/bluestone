const path = require("path")
const { WorkflowRecord, RecordingStep } = require('../../record/class')
const TestCase = require("../Entities/TestCase")
class WorkflowStepForPug {
    constructor(command, target, argDic, output) {
        this.command = command
        this.target = target
        this.argument = JSON.stringify(argDic)
        if (output == '') {
            this.output = ''
        } else {
            this.output = `vars:${output}`
        }

    }
    /**
     * Generate Pug-compatible array format
     * @returns {Array<string>}
     */

    generatePugOutput() {
        return [this.command, this.target, this.output, this.argument]
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
        txtTestCaseQueryKey: 'WORKFLOW_TEST_CASE',
        btnRunWorkflow: 'WORKFLOW_RUN_ALL',
        updateStepQueryKey: 'WORKFLOW_UPDATE_STEP',
        btnAbortExecution: 'WORKFLOW_ABORT_EXECUTION',
        btnFixScreenshotByRunTC: 'WORKFLOW_FIX_SCREENSHOT_BY_RUN_TESTCASE'
    }
    /**
     * 
     * @param {Array<import('../../record/class/index').RecordingStep>} steps 
     * @param {WorkflowRecord} backend
     */
    constructor(steps, backend) {
        this.workflowHeader = ['Operation', 'Target', 'Variable Declaration', 'Arguments', 'Actions']
        /** @type {List<WorkflowStepForPug>} */
        this.workflowSteps = null
        this.refreshWorkflowForPug(steps)
        this.textTestSuiteValue = ''
        this.textTestCaseValue = ''
        this.txtValidationStatus = 'Please click on Resolve Button to proceed'
        this.textFileName = ''
        this.backend = backend
        this.isValidationPass = false
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
    async getWorkflowForVue(){  //Daniel
        this.refreshWorkflowForVue(this.backend.steps)
        return this.workflowSteps
    }
    refreshWorkflowForVue(steps) {  //Daniel
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
            let description = step.command
            if (step.functionAst && step.functionAst.description && step.functionAst.description != '') {
                description = step.functionAst.description
            }
            let output = ''
            if (step.functionAst.returnJsDoc && step.functionAst.returnJsDoc.value) {
                output = step.functionAst.returnJsDoc.value
            }
            let workflowPug = new WorkflowStepForPug(step.command, target, argStr, output)
            return workflowPug
        })
        this.workflowSteps = workflowInfo
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
            let description = step.command
            if (step.functionAst && step.functionAst.description && step.functionAst.description != '') {
                description = step.functionAst.description
            }
            let output = ''
            if (step.functionAst.returnJsDoc && step.functionAst.returnJsDoc.value) {
                output = step.functionAst.returnJsDoc.value
            }
            let workflowPug = new WorkflowStepForPug(step.command, target, argStr, output)
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
        let secondKey = null
        let secondValue = null
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


            case WorkFlowPug.inBuiltQueryKey.txtTestSuiteQueryKey:
                this.textTestSuiteValue = firstValue
                this.backend.testSuiteName = firstValue
                break
            case WorkFlowPug.inBuiltQueryKey.txtTestCaseQueryKey:
                this.textTestCaseValue = firstValue
                this.backend.testcaseName = firstValue
                break
            case WorkFlowPug.inBuiltQueryKey.btnRunWorkflow:
                this.backend.runAllSteps()
                this.validateForm()
                break
            case WorkFlowPug.inBuiltQueryKey.btnFixScreenshotByRunTC:
                this.backend.runAllStepsViaBluestone()
                this.validateForm()
                break
            case WorkFlowPug.inBuiltQueryKey.btnAbortExecution:
                try {
                    this.backend.puppeteer.StepAbortManager.abortStepExecution()
                    this.backend.mochaDriver.abortScript()
                } catch (error) {
                }
                this.validateForm()
                break
            case WorkFlowPug.inBuiltQueryKey.btnCreateTestcaseQueryKey:
                if (this.validateForm(true)) {
                    let finalPath = await this.backend.writeCodeToDisk(this.textTestSuiteValue, this.textTestCaseValue)
                    this.txtValidationStatus = `Script created at: ${finalPath}`
                    this.isValidationPass = true
                }
                break
            case WorkFlowPug.inBuiltQueryKey.updateStepQueryKey:
                //from index
                secondKey = queryKeys[1]
                secondValue = query[secondKey]
                this.backend.moveStepTo(secondValue, firstValue)
                break
            default:
                break;
        }
    }
    /**
     * Genereate validaton action based on the current validation. If return true, it means no issue is found in current form
     * @param {boolean} skipExecutionResultCheck 
     * @param {boolean}
     */

    validateForm(skipExecutionResultCheck = false) {
        let steps = this.backend.steps
        this.txtValidationStatus = ''
        this.isValidationPass = false
        if (this.backend.puppeteer.isExecutionOngoing) {
            this.txtValidationStatus = 'Please wait, execution is going on.'
            return false
        }
        if (this.backend.testSuiteName == '') {
            this.txtValidationStatus = 'Please enter test suite name'
            return false
        }
        if (this.backend.testcaseName == '') {
            this.txtValidationStatus = 'Please enter test case name'
            return false
        }

        for (let i = 0; i < steps.length; i++) {
            let stepInfo = steps[i]
            //skip steps whose function does not need locator
            let elementSelectorParam = stepInfo.functionAst.params.find(item => item.type.name == 'ElementSelector')
            if (elementSelectorParam == null) continue
            if (stepInfo.command != 'goto' && stepInfo.target == 'no target') {
                this.txtValidationStatus = `<a href="#tr-${i}">Step is invalid. Please delete that and re-record the step. Go to step ${i}</a>`
                return false
            }
            if (stepInfo.finalLocator == '' || stepInfo.finalLocatorName == '') {
                this.txtValidationStatus = `<a href="#tr-${i}">Locator Missing. Go to step ${i}</a>`
                return false
            }
            if (stepInfo.isRequiredReview) {
                this.txtValidationStatus = `<a href="#tr-${i}">Bluestone has automatically fix a locator change. Go to step ${i} to review proposal</a>`
                return false
            }
        }
        if (!skipExecutionResultCheck) {
            for (let i = 0; i < steps.length; i++) {
                let stepInfo = steps[i]

                if (!stepInfo.result.isResultPass) {
                    let updateLocator = `<a href=#tr-${i}>modify locator or edit function </a>`
                    this.txtValidationStatus = `Step ${i} Failed: ${stepInfo.result.resultText}. Please run workflow again or ${updateLocator}`
                    return false
                }
            }
            this.isValidationPass = true
        }
        return true
    }
    /**
     * Genereate validaton action based on the current validation. If return true, it means no issue is found in current form
     * @param {boolean} skipExecutionResultCheck 
     * @param {TestCase} tc
     */
    validateFormVue(tc, skipExecutionResultCheck = false) {  //Daniel
        let steps = this.backend.steps
        this.txtValidationStatus = ''
        this.isValidationPass = false
        if (this.backend.puppeteer.isExecutionOngoing) {
            tc.message = 'Please wait, execution is going on.'
            tc.result = false
            return tc
        }

        for (let i = 0; i < steps.length; i++) {
            let stepInfo = steps[i]
            //skip steps whose function does not need locator
            let elementSelectorParam = stepInfo.functionAst.params.find(item => item.type.name == 'ElementSelector')
            if (elementSelectorParam == null) continue
            if (stepInfo.command != 'goto' && stepInfo.target == 'no target') {
                this.txtValidationStatus = `<a href="#tr-${i}">Step is invalid. Please delete that and re-record the step. Go to step ${i}</a>`
                tc.message = this.txtValidationStatus
                tc.result = false
                return tc
            }
            if (stepInfo.finalLocator == '' || stepInfo.finalLocatorName == '') {
                this.txtValidationStatus = `<a href="#tr-${i}">Locator Missing. Go to step ${i}</a>`
                tc.message = this.txtValidationStatus
                tc.result = false
                return tc
            }
            if (stepInfo.isRequiredReview) {
                this.txtValidationStatus = `<a href="#tr-${i}">Bluestone has automatically fix a locator change. Go to step ${i} to review proposal</a>`
                tc.message = this.txtValidationStatus
                tc.result = false
                return tc
            }
        }
        if (!skipExecutionResultCheck) {
            for (let i = 0; i < steps.length; i++) {
                let stepInfo = steps[i]

                if (!stepInfo.result.isResultPass) {
                    let updateLocator = `<a href=#tr-${i}>modify locator or edit function </a>`
                    this.txtValidationStatus = `Step ${i} Failed: ${stepInfo.result.resultText}. Please run workflow again or ${updateLocator}`
                    tc.message = this.txtValidationStatus
                    tc.result = false
                    return tc
                }
            }
            this.isValidationPass = true
        }
        tc.result = true
        return tc
    }
    /**
     * Function to run all the workflow
     * @param {TestCase} pug 
     */
    async runWorkflow(pug){  //Daniel 
        this.backend.runAllSteps()
        pug = this.validateFormVue(pug)
        return pug
    }

    async abortWorkflow(pug){ //Daniel
        try {
            this.backend.puppeteer.StepAbortManager.abortStepExecution()
            this.backend.mochaDriver.abortScript()
        } catch (error) {
        }
        this.validateFormVue(pug)
        return pug
    }

    async navageteToFailure(pug){ //Daniel
        this.backend.runAllStepsViaBluestone()
        this.validateFormVue(pug)
        return pug
    }

    async moveStepUp(index){  //DAniel I'm not sure what is the input needed
        this.backend.moveStepInArray(index, -1)
    }

    async moveStepDown(index){  //DAniel I'm not sure what is the input needed
        this.backend.moveStepInArray(index, 1)
    }

    async moveStepToIndex(index, diff){  //Daniel I'm not sure what is the input needed
        this.backend.moveStepInArray(index, diff)
    }

    async deleteStep(index){  //DAniel I'm not sure what is the input needed
        this.backend.steps.splice(index, 1)
    }
}

module.exports = WorkFlowPug