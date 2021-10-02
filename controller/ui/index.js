const LocatorDefiner = require('./class/LocatorDefiner')
const Operation = require('./class/Operation')
const Workflow = require('./class/Workflow')
const { WorkflowRecord } = require('../record/class')
class UI {
    /**
     * 
     * @param {WorkflowRecord} backend 
     */
    constructor(backend) {
        this.backend = backend
        this.locatorDefiner = new LocatorDefiner('', '', '', '', [], -1)
        this.operation = new Operation(this.backend)
        this.workflow = new Workflow([], this.backend)

    }
    async updateUserInputForSpy(query) {
        let queryKeys = Object.keys(query)
        //if there is no query, we will just return
        if (queryKeys.length == 0) {
            return
        }
        await this.operation.update(query)
        this.workflow.update(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        let targetStep
        switch (firstKey) {
            case Workflow.inBuiltQueryKey.btnEditWorkflow:
                targetStep = this.backend.steps[firstValue]
                this.__repopulateOperationUI(targetStep)
                break
            default:
                break;
        }
    }

    /**
     * Based on the current step in the workflow, repopulate operation view
     * @param {RecordingStep} step 
     */
    __repopulateOperationUI(step) {

        let currentGroupKeys = Object.keys(this.backend.operationGroup)
        let findOperation = false
        for (let i = 0; i < currentGroupKeys.length; i++) {
            let groupKey = currentGroupKeys[i]
            /** @type {Array<FunctionAST>} */
            let operations = this.backend.operationGroup[groupKey].operations
            let currentOperation = operations.find(item => {
                if (item == null) return false
                return item.name == step.command
            })

            if (currentOperation != null) {
                this.operation.spy.userSelection.currentGroup = groupKey
                this.operation.spy.userSelection.currentOperation = step.functionAst.name
                this.operation.browserSelection.currentInnerText = step.targetInnerText
                this.operation.browserSelection.currentSelector = step.target
                this.operation.browserSelection.selectorPicture = step.targetPicPath
                this.operation.browserSelection.lastOperationTimeoutMs = step.timeoutMs
                findOperation = true
                break
            }

        }
        if (!findOperation) {
            this.backend.operation.spy.result.isPass = false
            this.backend.operation.spy.result.text = `Unable to find function ${step.command}`
        }
    }

}

module.exports = UI
