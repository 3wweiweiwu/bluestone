const FunctionAST = require('../../ast/class/Function')
const JsDocTag = require('../../ast/class/JsDocTag')
const { RecordingStep, WorkflowRecord } = require('../../record/class')
const path = require('path')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
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
class Operation {
    /**
     * 
     * @param {WorkflowRecord} backend 
     */
    constructor(backend) {
        this.backend = backend
        this.spy = {

            userSelection: {
                currentGroup: '',
                currentOperation: '',
                currentArgument: [],
                currentLocatorIndex: -1,
                currentLocatorPath: '',
                currentLocatorName: '',
                currentLocatorSelector: '',
                stepIndex: -1
            },
            validation: {
                btnAddStep: ''
            },




        }
    }
    get browserSelection() {
        return this.backend.operation.browserSelection
    }
    get operationResult() {
        return this.backend.operation.spy.result
    }

    static inbuiltQueryKey = {
        currentGroup: 'currentGroup',
        currentOperation: 'currentOperation',
        currentArgument: 'currentArgument',
        currentArgumentIndex: 'currentArgumentIndex',
        btnAddStep: 'btnAddStep',
        btnModifyStep: 'modifyStep',
        btnCancel: 'btnCancel',
        btnRun: 'btnRun',
        txtSelector: 'txtSelector',
        btnUpdateRecording: 'btnUpdateRecording',
        btnMuteFuncQueryKey: 'btnMuteFuncQueryKey'
    }
    static inbuiltOperation = {
        textEqual: 'testTextEqual',
        itemVisible: 'itemVisible',
        itemInvisible: 'itemInvisible',
        hover: 'hover'

    }

    /**
     *  based on current selector info, return current selector we have 
     * @returns {FunctionAST}
     */
    getCurrentOperation() {
        //check group info
        if (this.spy.userSelection.currentGroup == null || this.spy.userSelection.currentGroup == '') {
            return ''
        }
        //check operation info
        if (this.spy.userSelection.currentOperation == null || this.spy.userSelection.currentOperation == '') {
            return ''
        }
        let allOperationGroup = this.backend.operationGroup
        let operationInfo = allOperationGroup[this.spy.userSelection.currentGroup].operations.find(item => {
            return item.name == this.spy.userSelection.currentOperation
        })
        this.backend.operation.browserSelection.currentOpeartion = operationInfo
        return operationInfo
    }
    getCurrentGroup() {

        if (this.spy.userSelection.currentGroup == null || this.spy.userSelection.currentGroup == '') {
            return ''
        }

        let allOperationGroup = this.backend.operationGroup
        return allOperationGroup[this.spy.userSelection.currentGroup]
    }
    /**
     * Validate current ui and see if all elements has been popoulated
     * If all elements have been populated, this.ui.spy.validation.btnAddStep will equal to ''
     * Otherwise, it will save validation error in this.ui.spy.validation.btnAddStep
     * @returns 
     */
    __validateOverallFormForSpy() {

        this.spy.validation.btnAddStep = ''
        //check group info
        if (this.spy.userSelection.currentGroup == null || this.spy.userSelection.currentGroup == '') {
            this.spy.validation.btnAddStep = `Please input group info`
            return
        }

        //check operation info
        if (this.spy.userSelection.currentOperation == null || this.spy.userSelection.currentOperation == '') {
            this.spy.validation.btnAddStep = `Please input operation info`
            return
        }
        //all argument need to be populated
        let currentOperation = this.getCurrentOperation()
        currentOperation.params.filter(item => {
            //find out empty argument only for string and number input becasue we won't take any other input type here
            return (item.type.name == 'string' || item.type.name == 'number') && (item.value == null || item.value == '')
        })
            .forEach(item => item.value = '')
    }
    /**
     * add or modify the step based on stepIndex
     * @param {number} stepIndex add or modify steps if stepIndex is null, it means add the step to the end
     */
    async __addOrModifyStep(stepIndex) {
        this.__validateOverallFormForSpy()
        //if validation is done correctly, add current operation
        if (this.spy.validation.btnAddStep == '') {
            let currentOperation = this.getCurrentOperation()
            let command = currentOperation.name

            let target = this.backend.operation.browserSelection.currentSelector

            let targetInnerText = this.backend.operation.browserSelection.currentInnerText
            let targetPicPath = this.backend.operation.browserSelection.selectorPicture
            let timeoutMs = this.backend.operation.browserSelection.lastOperationTimeoutMs
            let htmlPath = this.backend.operation.browserSelection.selectorHtmlPath
            let parentFrame = this.backend.operation.browserSelection.parentIframe
            let potentialMatch = this.backend.operation.browserSelection.potentialMatch
            let atomicTree = this.backend.operation.browserSelection.atomicTree
            let framePotentialMatch = this.backend.operation.browserSelection.framePotentialMatch

            //construct operation step
            let step = new RecordingStep({ command, target, timeoutMs: timeoutMs, targetPicPath, targetInnerText, functionAst: currentOperation, htmlPath: htmlPath, iframe: parentFrame, potentialMatch: potentialMatch, healingTree: atomicTree, framePotentialMatch })

            //update step if currentLocatorIndex has been specified
            let currentLocatorIndex = this.backend.operation.browserSelection.currentSelectedIndex
            if (currentLocatorIndex) {
                let locator = this.backend.locatorManager.locatorLibrary[currentLocatorIndex]
                step.finalLocatorName = locator.path
                step.finalLocator = locator.Locator
            }


            if (stepIndex == null)
                await this.backend.addStep(step)
            else
                this.backend.modifyStep(stepIndex, step)
            //refresh active function so that we can point the functionASt to new isntances
            await this.backend.refreshActiveFunc()
            this.backend.operation.browserSelection.lastOperationTimeoutMs = 0
            console.log(this.backend.steps)
        }
    }
    async update(query) {
        let queryKeys = Object.keys(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        switch (firstKey) {
            case Operation.inbuiltQueryKey.currentGroup:
                this.spy.userSelection.currentGroup = firstValue
                break;
            case Operation.inbuiltQueryKey.currentOperation:
                this.spy.userSelection.currentOperation = firstValue
                this.spy.userSelection.currentArgument = this.getCurrentOperation().params.map(argument => {
                    return argument.description
                })
                break;
            case Operation.inbuiltQueryKey.btnAddStep:
                this.__addOrModifyStep(null)
                break;
            case Operation.inbuiltQueryKey.btnModifyStep:
                this.__addOrModifyStep(this.spy.userSelection.stepIndex)
                break;
            case Operation.inbuiltQueryKey.btnCancel:
                this.backend.isRecording = true
                this.backend.spyVisible = false
                this.backend.isCaptureHtml = true
                break;
            case Operation.inbuiltQueryKey.txtSelector:
                this.backend.operation.browserSelection.currentSelector = firstValue
                break;
            case Operation.inbuiltQueryKey.btnRun:
                let currentOperation = this.backend.getCurrentOperation()

                let elementSelector = new ElementSelector([this.backend.operation.browserSelection.currentSelector], '', 'Current Selector')
                let result = await this.backend.puppeteer.runCurrentStep(currentOperation, elementSelector, this.backend.operation.browserSelection.parentIframe)
                this.backend.operation.spy.result.isPass = result.isResultPass
                this.backend.operation.spy.result.text = result.resultText
                // this.backend.puppeteer.refreshSpy()
                await this.backend.puppeteer.openBluestoneTab("refresh")
                break;
            case Operation.inbuiltQueryKey.currentArgument:
                //update ui value
                //TODO: allow url like https://todomvc.com/examples/angularjs/#/ to work
                let currentArgumentIndex = query[Operation.inbuiltQueryKey.currentArgumentIndex]
                let currentQueryKeyForValue = query[Operation.inbuiltQueryKey.currentArgument]
                let currentFunction = this.getCurrentOperation()
                let argIndex = this.__convertUIIndex2ArgumentIndex(currentArgumentIndex, currentFunction)
                currentFunction.params[argIndex].value = currentQueryKeyForValue

                //update user selection value
                this.spy.userSelection.currentArgument[currentArgumentIndex] = currentQueryKeyForValue
                break
            case Operation.inbuiltQueryKey.btnMuteFuncQueryKey:
                this.backend.updateMutedFunctionForRecording(firstValue)
                break;
            case Operation.inbuiltQueryKey.btnUpdateRecording:
                this.backend.isRecording = !this.backend.isRecording
                break;
            default:
                break;
        }
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
    getFunctionMuteState() {
        let functionList = this.backend.astManager.funcRepo.map(item => {
            return {
                caption: item.name,
                isMuted: this.backend.mutedFunctionForRecording.includes(item.name).toString()
            }
        })
        return functionList

    }
    /**
     * return a list of group info for the pug to consume 
     * @returns {Array<PugDropDownInfo>}
     */
    getSpyGroupsInfoForPug() {
        let allOperationGroup = this.backend.operationGroup
        let groupId = Object.keys(allOperationGroup)
        let groupInfo = groupId.map(id => {
            return new PugDropDownInfo(id, allOperationGroup[id].text, `spy?${Operation.inbuiltQueryKey.currentGroup}=${id}`)
        })
        return groupInfo
    }
    /**
     * return a list of operation based on curent group
     * @returns {Array<PugDropDownInfo>}
     */
    getOperationInfoForPug() {
        let currentGroup = this.spy.userSelection.currentGroup

        if (currentGroup == '') {
            return []
        }
        let operationGroup = this.backend.operationGroup
        let operationInfo = operationGroup[currentGroup].operations.map(item => {
            return new PugDropDownInfo(item.name, item.description, `spy?${Operation.inbuiltQueryKey.currentOperation}=${item.name}`)
        })

        return operationInfo

    }
    /**
     * Get argument information for pug
     * @returns {Array<JsDocTag>}
     */
    getArgumentsInfoForPug() {
        let operation = this.getCurrentOperation()
        if (operation == null) return []
        if (operation.params == null) {
            return []
        }
        let result = []
        //add pugType property for the UI input
        let uiIndex = 0
        /**@type {Array<JsDocTag>} */
        let operationArguments = operation.params.reduce((previousValue, currentValue, currentIndex) => {
            let standardizedCurrentType = currentValue.type.name.toLowerCase()
            if (standardizedCurrentType == 'string') {
                currentValue['pugType'] = 'text'
                previousValue.push(currentValue)
                //if this is string for text equal, automatically populate value
                if (operation.name == Operation.inbuiltOperation.textEqual) {
                    operation.params[currentIndex].value = this.backend.operation.browserSelection.currentInnerText
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
    /**
     * get pure picture name so that front end can append that to the url
     * @param {string} picturePath 
     * @returns 
     */
    getSpySelectorPictureForPug(picturePath = this.backend.operation.browserSelection.selectorPicture) {
        let pictureName = ''
        if (picturePath != '') {
            pictureName = path.basename(picturePath)
        }



        return pictureName
    }

    /**
     * Get introduction text for group
     * @returns {string}
     */
    getCurrentGroupText() {
        let current = this.getCurrentGroup()
        let text = ''
        if (current != null) {
            text = current.text
        }
        return text
    }
    /**
     * Get introduction text for operation
     * @returns {string}
     */
    getCurrentOperationText() {
        let current = this.getCurrentOperation()
        let text = ''
        if (current != null) {
            text = current.description
        }
        return text
    }
}
module.exports = Operation