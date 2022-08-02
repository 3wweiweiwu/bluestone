const path = require('path')
const config = require('../../../config')
const { LocatorManager, Locator } = require('../../locator/index')
const AstManager = require('../../ast')
const FunctionAST = require('../../ast/class/Function')
const JsDocTag = require('../../ast/class/JsDocTag')
const { testTextEqual } = require('../../../ptLibrary/functions/inbuiltFunc')
const _eval = require('eval')
const StepResult = require('../../mocha/class/StepResult')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')
const { Page } = require('puppeteer-core')
const PuppeteerControl = require('../../puppeteer/class')
const fs = require('fs').promises
const HtmlCaptureStatus = require('./HtmlCaptureStatus')
const Testcase = require('../../coder/class/Testcase')
const Navigation = require('../class/NavigationStatus')
const PicCapture = require('../class/PicCapture')
const ptConstant = require('../../../ptLibrary/functions/inbuiltFunc').VAR
const RecordingStep = require('./RecordingStep')
const MochaDriver = require('../../mocha/index')
const TestCaseLoader = require("../../ast/TestCaseLoader")
const os = require('os')
const TestcaseLoader = require('../../ast/TestCaseLoader')
const getErrorStepIndexByErrorStack = require('../../../ptLibrary/functions/getErrorStepIndexByStack')
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




class WorkflowRecord {
    /**     * 
     * @param {PuppeteerControl} puppeteer 
     */
    constructor(puppeteer) {
        //TODO: seperate step into another class
        this.puppeteer = puppeteer
        this.name = ''
        this.testcaseName = ''
        this.testSuiteName = ''
        /** 
         * @type {Array<RecordingStep>} 
         */
        this.steps = []
        this.lastOperationTimestamp = Date.now()
        this.__isRecording = true
        this.__isCaptureHtml = true
        this.astManager = new AstManager(config.code.locatorPath)
        this.__isNavigationPending = false
        this.__codePath = ''
        this.operationGroup = {
            customizedFunctions: {
                text: 'Run Customzied Function',
                operations: []
            }
        }
        this.navigation = new Navigation()
        this.operation = {
            spy: {
                runCurrentOperation: false,
                visible: false,
                result: { isPass: null, text: '' },
            },
            browserSelection: {
                currentSelectedIndex: null,
                currentSelector: '',
                selectorPicture: '',
                selectorHtmlPath: '',
                currentInnerText: 'default',
                parentIframe: [],
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                lastOperationTime: Date.now(),
                lastOperationTimeoutMs: 0,
                currentOpeartion: null,
                __htmlCaptureInProcess: [],
                potentialMatch: [],
                framePotentialMatch: [],
                recommendedLocator: [],
                atomicTree: ''
            },
        }
        this.picCapture = new PicCapture()
        this.htmlCaptureStatus = new HtmlCaptureStatus()
        this.locatorManager = new LocatorManager(config.code.locatorPath)
        this.inbuiltFuncPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        this.initializeFunctions()
        /**@type {MochaDriver} */
        this.mochaDriver = null
    }
    async initializeFunctions() {
        console.log('Initializing Bluestone...')
        await this.astManager.loadFunctions(config.code.funcPath)
        await this.astManager.loadFunctions(this.inbuiltFuncPath)
        console.log('Bluestone has started')
    }
    /**
     * Based on the path specified, update picture in locator definer
     * @param {string} picPath 
     */
    async updateLocatorDefinerPic(picPath) {
        let targetPath = path.join(__dirname, '../../../public/temp/componentPic/locatorDefiner.png')
        try {
            await fs.unlink(targetPath)
        } catch (error) {

        }
        try {
            await fs.access(picPath)
            await fs.copyFile(picPath, targetPath)
        } catch (error) {
            return
        }
    }
    get isNavigationPending() {
        return this.__isNavigationPending
    }
    set isNavigationPending(isPending) {
        this.__isNavigationPending = isPending
    }
    get codePath() {
        return this.__codePath
    }
    /**
     * Provide list of locator for target element
     * @param {string} targetLocator 
     * @param {Array<string>} parentFrame 
     */
    async getRecommendedLocatorFromDefiner(targetLocator, parentFrame) {
        /**
         * From implementation perspective, we will first assign a place holder token
         * Since locator generation is time-consuming, we will do it in background
         * Once it is finish, it will update locator with place holder in place
         */
        let locatorPlaceHolderId = `//*[@Refresh-Page-To-Load-Recommendations='${Date.now().toString()}']`
        this.operation.browserSelection.recommendedLocator = [locatorPlaceHolderId]
        let locators = await this.puppeteer.getRecommendedLocator(targetLocator, parentFrame)
        this.operation.browserSelection.recommendedLocator = locators
        this.locatorManager.setRecommendedLocator(locatorPlaceHolderId, locators)
    }
    /**
     * Scan through html path and fix unavailable path
     * This function is created because sometimes, certain html file is blank
     * I cannot find what cause this issue. It is just a workaround.
     * @param {HtmlCaptureStatus} htmlCaptureRepo 
     */
    async fixHtmlPathIssue(htmlCaptureRepo) {
        let goodPathIndexList = []
        let badPathIndexList = []
        //create index for good/bad index
        for (let i = 0; i < this.steps.length; i++) {
            try {
                let htmlPath = this.steps[i].htmlPath
                await fs.access(htmlPath)
                goodPathIndexList.push(i)
            } catch (error) {
                badPathIndexList.push(i)
            }
        }
        badPathIndexList = badPathIndexList.filter(i => i != 0)
        //fix indexes based on its proximity
        badPathIndexList.forEach(i => {
            let closestHtmlRecord = htmlCaptureRepo.getLastCaptureBeforeTimeStamp(this.steps[i].timeStamp)
            this.steps[i].htmlPath = closestHtmlRecord.path
        })
    }
    getCurrentOperation() {
        return this.operation.browserSelection.currentOpeartion
    }
    /**
     * Generate auto-healing information and update function parameter to include healing info
     * @param {string} testCase test case name
     */
    async __updateHealingInfo(testCase) {
        let snapshotFolder = path.join(config.code.dataPath, testCase, '/snapshot/')
        try {
            await fs.access(snapshotFolder)
        } catch (error) {
            await fs.mkdir(snapshotFolder, { recursive: true })
        }

        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i]
            let snapshotName = `Bluestone-Snapshot-${i}`


            let snapshotPath = path.join(snapshotFolder, snapshotName + ".json")
            //find out auto-healing param
            let param = step.functionAst.params.find(item => {
                return item.type.name == 'HealingSnapshot'
            })
            if (param != null) {
                param.value = snapshotName
                try {
                    await fs.writeFile(snapshotPath, step.healingTree)
                } catch (error) {

                }

            }
        }




    }
    /**
     * Write Testcase code into script output folder and update bluestone-locator.js 
     * @returns {string} output path
     */
    async writeCodeToDisk() {
        let testSuite = this.testSuiteName
        let testCase = this.testcaseName
        await this.__updateHealingInfo(testCase)
        //write code to disk
        let functionAstList = this.getAllFunctionAst()
        let coder = new Testcase(functionAstList, config.code.locatorPath, config.code.funcPath, config.code.configPath, config.code.scriptFolder, config.code.inbuiltFuncPath)
        coder.testSuite = testSuite
        coder.testCase = testCase
        let finalPath = await coder.writeCodeToDisk()
        this.__codePath = finalPath
        //update locator
        for (let i = 0; i < this.steps.length; i++) {
            let step = this.steps[i]
            //ignore locator for goto functon
            if (step.command == WorkflowRecord.inBuiltFunc.goto) continue

            //update step information accordingly
            let newLocator = await this.locatorManager.updateLocator(step.finalLocatorName, step.finalLocator, step.targetPicPath)

            //if it is a new locator, add the newly created locator to possible match
            if (newLocator) {
                newLocator.screenshot = path.basename(step.targetPicPath)
                this.steps.forEach(item => {
                    if (item.finalLocatorName == step.finalLocatorName) {
                        item.potentialMatch.push(newLocator)
                    }
                })
            }

        }
        //output locator to disk
        await this.locatorManager.outputLocatorToDisk()

        return finalPath
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
    static inBuiltFunc = {
        testTextEqual: 'testTextEqual',
        hover: 'hover',
        waitElementVisible: 'waitElementVisible',
        testElementInvisible: 'testElementInvisible',
        waitElementExists: 'waitElementExists',
        hoverMouse: 'hoverMouse',
        change: 'change',
        click: 'click',
        goto: 'goto',
        keydown: 'keydown',
        gotoFrame: 'gotoFrame',
        closeBrowser: 'closeBrowser',
        upload: 'upload',
        waitForTimeout: 'waitForTimeout',
        basicAuthenticate: 'basicAuthenticate',
        clearBrowserCache: 'clearBrowserCache',
        dragstart: 'dragstart',
        drop: 'drop',
        scroll: 'scroll',
        getStyleAttribute: 'getStyleAttribute'
    }
    static inbuiltEvent = {
        refresh: PuppeteerControl.inbuiltEvent.refresh
    }
    /**
     * Based on the active functions, populate available functions in the group
     * @param {Array<import('../../ast/class/Function')>} activeFunctions 
     */
    mapOperationToGroups(activeFunctions) {
        const inBuiltFuncNames = [
            WorkflowRecord.inBuiltFunc.testTextEqual,
            WorkflowRecord.inBuiltFunc.waitElementVisible,
            WorkflowRecord.inBuiltFunc.testElementInvisible,
            WorkflowRecord.inBuiltFunc.hoverMouse
        ]
        //populate default list
        let groupInfo = {
            assert: {
                text: 'Verify',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.testTextEqual),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitElementExists),
                ]
            },
            waitTill: {
                text: 'Wait Till',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitElementVisible)
                ]
            },
            inbuiltFunction: {
                text: 'Run In-built function',
                operations: [
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.change),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.goto),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.click),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.keydown),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.hover),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.closeBrowser),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.upload),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.waitForTimeout),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.basicAuthenticate),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.clearBrowserCache),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.dragstart),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.drop),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.scroll),
                    this.astManager.getFunction(WorkflowRecord.inBuiltFunc.getStyleAttribute)
                ]
            },
            customizedFunctions: {
                text: this.operationGroup.customizedFunctions.text,
                operations: []
            }
        }
        //populate customized function
        let customizedFunctions = activeFunctions.filter(item => {
            return !inBuiltFuncNames.includes(item.name)
        })
        groupInfo.customizedFunctions.operations = customizedFunctions
        this.operationGroup = groupInfo

    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     */
    __addSwitchIframeForStep(step) {
        let gotoFrameCommand = WorkflowRecord.inBuiltFunc.gotoFrame
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != gotoFrameCommand && step.iframe != null) {
            let switchToFrameAst = this.astManager.getFunction(gotoFrameCommand)
            /**@type {RecordingStep} */
            let switchFrameStep = JSON.parse(JSON.stringify(step))
            switchFrameStep = RecordingStep.restore(switchFrameStep, switchToFrameAst, gotoFrameCommand)

            //for iframe, its parent iframe will be its parent and its locator should be last xpath
            let parentIframe = step.iframe.slice(0, step.iframe.length - 1)
            let currentIframe = step.iframe[step.iframe.length - 1]
            switchFrameStep.target = currentIframe
            if (currentIframe == null) {
                switchFrameStep.target = ptConstant.parentIFrameLocator
            }
            switchFrameStep.iframe = parentIframe
            switchFrameStep.potentialMatch = step.framePotentialMatch || []
            let waitTime = step.timeoutMs
            if (waitTime < 3000)
                waitTime = 3000
            switchFrameStep.functionAst.params[3].value = waitTime

            this.steps.push(switchFrameStep)
        }
    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     */
    __addWaitForFrame(step) {
        let waitCommand = WorkflowRecord.inBuiltFunc.waitElementExists
        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait
        if (step.command != 'goto' && step.command != waitCommand && step.timeoutMs != 0 && step.iframe != null) {
            let waitFunctionAst = this.astManager.getFunction(waitCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            waitStep.target = waitStep.iframe
            waitStep = RecordingStep.restore(waitStep, waitFunctionAst, waitCommand)
            //hard code wait time param here
            waitStep.functionAst.params[2].value = step.timeoutMs
            this.steps.push(waitStep)
        }

    }
    /**
     * Based on current step, decide if add wait before the call
     * @param {RecordingStep} step the operation step
     *  @param {boolean} isFrame the operation step
     */
    __addWaitForSteps(step, isFrame = false) {
        let waitCommand = 'waitElementExists'
        //will not add wait step for those function who does not need to interact with specific element
        let elementSelectorParam = step.functionAst.params.find(item => item.type.name == 'ElementSelector')


        //cosntruct wait step. insert wait step only if timeout is greater than 0 and previous command is not wait

        if (step.command != 'goto' && step.command != waitCommand && step.timeoutMs != 0 && elementSelectorParam != null) {
            let waitFunctionAst = this.astManager.getFunction(waitCommand)
            let waitStep = JSON.parse(JSON.stringify(step))
            if (isFrame) {
                //for iframe, its parent iframe will be its parent and its locator should be last xpath
                waitStep.potentialMatch = step.framePotentialMatch
                let parentIframe = step.iframe.slice(0, step.iframe.length - 1)
                let currentIframe = step.iframe[step.iframe.length - 1]
                waitStep.target = currentIframe
                if (currentIframe == null) {
                    waitStep.target = ptConstant.parentIFrameLocator
                }
                waitStep.iframe = parentIframe
            }
            waitStep = RecordingStep.restore(waitStep, waitFunctionAst, waitCommand)
            //hard code wait time param here
            let newWaitTime = step.timeoutMs
            if (newWaitTime < 3000) newWaitTime = 3000
            waitStep.functionAst.params[2].value = newWaitTime
            this.steps.push(waitStep)
        }

    }
    /**
     * Correlate steps with existing locator. IF there is one and exactly one match, we will autoamtically map the step with the locator
     */
    resolveExistingLocatorInSteps() {
        //automatically match all existing selectors
        this.steps.forEach(item => {
            if (item.target == ptConstant.parentIFrameLocator) {
                //if we are working with parent frame, we will search through locator library to find potential match
                //find if we have defined parent iframe in the past
                let parentFrame = this.locatorManager.locatorLibrary.find(item => { return item.Locator.includes(ptConstant.parentIFrameLocator) })
                if (parentFrame) {
                    item.potentialMatch = [JSON.parse(JSON.stringify(parentFrame))]

                }

            }
            if (item.potentialMatch && item.potentialMatch.length == 1 && item.finalLocator.length == 1 && item.finalLocator[0] == '') {
                item.finalLocatorName = item.potentialMatch[0].path
                item.finalLocator = item.potentialMatch[0].Locator
            }
            //update ElementSelector in the param
            let elementSelectorParam = item.functionAst.params.find(item => { return item.type.name == 'ElementSelector' })
            if (elementSelectorParam) {
                elementSelectorParam.value = item.finalLocatorName
            }

        })
    }
    /**
     * Get index of the step that haven't been mapped
     * -1 if nothing being found
     * @returns {number}
     */
    findPendingLocatorInStep() {
        let stepIndex = -1;
        //find out selector that is pending correlaton
        stepIndex = this.steps.findIndex(item => {
            //will not check final locator for those steps whose function does not use element selector
            let elementSelectorParam = item.functionAst.params.find(item => item.type.name == 'ElementSelector')
            if (elementSelectorParam == null) return false
            return item.finalLocator == '' || item.finalLocator == ''
        })
        return stepIndex
    }
    /**
     * Get index of the step that runs failed or required review
     * -1 if nothing being found
     * @returns {number}
     */
    getFailedOrReviewRequiredStepIndex() {
        let stepIndex = -1;
        //find out selector that is pending correlaton
        stepIndex = this.steps.findIndex(item => {
            //will not check final locator for those steps whose function does not use element selector
            let elementSelectorParam = item.functionAst.params.find(item => item.type.name == 'ElementSelector')
            if (elementSelectorParam == null) return false
            return item.isRequiredReview || item.result.isResultPass == false
        })
        return stepIndex
    }
    /**
     * Return all functionAst object for ast purpose
     * @returns {FunctionAST[]}
     */
    getAllFunctionAst() {
        let result = []
        this.steps.forEach(item => {
            result.push(item.functionAst)
        })
        return result
    }
    /**
     * Run All steps and assign result to step via bluestone
     * @returns {number} index of the failed step. -1 if everything pass
     */
    async runAllSteps() {
        let failedStepIndex = -1
        //check if there is any un-correlated locator in step
        failedStepIndex = this.findPendingLocatorInStep()
        if (failedStepIndex != -1) {
            this.steps[failedStepIndex].result = new StepResult()
            this.steps[failedStepIndex].result.resultText = 'Locator has not been correleated'
            return failedStepIndex
        }

        this.mochaDriver = new MochaDriver(this.codePath, this.locatorManager, this.astManager, 999999)
        let result = await this.mochaDriver.runScript()
        //run mark passed result
        for (let i = 0; i < this.steps.length; i++) {
            if (result.failedStep == -1 || result.failedStep > i)
                this.steps[i].result.isResultPass = true
            else {
                this.steps[i].result.isResultPass = false
                break
            }


        }
        //mark failed step if any failure is within the range
        if (result.isResultPass == false && result.failedStep != -1 && result.failedStep < this.steps.length) {
            this.steps[result.failedStep].result.isResultPass = false
            this.steps[result.failedStep].result.resultText = result.resultNote
        }
        //mark failed step if failure it outside the scope
        if (result.isResultPass == false && (result.failedStep > this.steps.length || result.failedStep == -1)) {
            this.steps[0].result.isResultPass = false
            this.steps[0].result.resultText = 'Unable to find failed step. ' + result.resultNote
        }
        await this.puppeteer.openBluestoneTab('workflow')
        return failedStepIndex

    }
    /**
     * Run All steps and assign result to step via bluestone
     * @param {number} startingIndex
     * @param {number} endIndex
     * @returns {number} index of the failed step. -1 if everything pass
     */
    async runAllStepsViaBluestone(startingIndex = 0, endIndex = null) {
        let failedStepIndex = -1
        //check if there is any un-correlated locator in step
        let pendingLocatorStepIndex = this.findPendingLocatorInStep()
        let failedOrReviewRequiredStepIndex = this.getFailedOrReviewRequiredStepIndex()
        //find out smallest non -1 element in between pendingLocatorStepIndex and failedOrReviewRequiredStepIndex
        // that number will become our end index
        let sortedList = [pendingLocatorStepIndex, failedOrReviewRequiredStepIndex].filter(item => item != -1).sort((a, b) => a - b)
        if (sortedList.length == 0) {
            endIndex = this.steps.length
        }
        else {
            endIndex = sortedList[0]
        }
        //run step one by one
        for (let i = startingIndex; i < endIndex; i++) {
            let step = this.steps[i]
            let elementSelector = new ElementSelector(step.finalLocator, '', step.finalLocatorName)

            let result = await this.puppeteer.runCurrentStep(step.functionAst, elementSelector, step.iframe)
            await this.puppeteer.StepAbortManager.stopStepAbortMonitor()
            await new Promise(resolve => setTimeout(resolve, 300))
            this.steps[i].result = result
            if (!result.isResultPass) {
                failedStepIndex = i
                break
            }

            let stepSnapshotPath = path.join(os.tmpdir(), 'stepSnapshot.png')
            let proposedSnapshotPath = this.getPicPath()
            try {
                await fs.access(stepSnapshotPath)
                await fs.copyFile(stepSnapshotPath, proposedSnapshotPath)
                this.steps[i].htmlPath = proposedSnapshotPath
            } catch (error) {

            }
        }
        await this.puppeteer.openBluestoneTab('workflow')
        return failedStepIndex
    }
    /**
     * get active functions based on active elements on screen
     * @returns {Array<import('../../ast/class/Function')>}
     */
    getActiveCustomFunctions() {
        this.operationGroup.customizedFunctions.operations = []
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
        this.operation.spy.visible = isVisible
    }
    get spyVisible() {
        return this.operation.spy.visible
    }
    set spyBrowserSelectionPicPath(picturePath = '') {
        this.operation.browserSelection.selectorPicture = picturePath
    }
    set spyBrowserSelectionHtmlPath(htmlPath = '') {
        this.operation.browserSelection.selectorHtmlPath = htmlPath
    }








    /**
     * Set Last operation time
     */
    setLastOperationTime() {
        this.operation.browserSelection.lastOperationTime = Date.now()
    }

    get isCaptureHtml() {
        return this.__isCaptureHtml
    }
    set isCaptureHtml(status) {
        this.__isCaptureHtml = status
    }


    set isRecording(recordStatus) {
        this.__isRecording = recordStatus
    }
    get isRecording() {
        return this.__isRecording
    }
    /**
     * Refresh available functionGroup based on active element in current screen
     * This function will load both inbuilt function and custom function
     */
    async refreshActiveFunc() {

        // await this.astManager.loadFunctions(config.code.funcPath)
        let activeFuncs = this.getActiveCustomFunctions()
        this.mapOperationToGroups(activeFuncs)
    }
    /**
     * add current event to the list
     * @param {RecordingStep} event 
     */
    async addStep(event) {
        //handle change in iframe
        let lastStep = this.steps[this.steps.length - 1]
        if (lastStep != null && JSON.stringify(event.iframe) != JSON.stringify(lastStep.iframe)) {
            // this.__addWaitForSteps(event, true)
            this.__addSwitchIframeForStep(event)
        }
        this.__addWaitForSteps(event, false)

        this.steps.push(event)
        this.__handleChangeNPressCombo(event)
        this.__handleEnterNClickCombo(event)
        this.__handleFileUpload(event)
        this.__handleFileDownloadProgressUpdate(event)
        this.__handleScroll(event)
        this.setLastOperationTime()
        await this.refreshActiveFunc()
    }
    /**
     * As we receiving update from file download, try to combine the progress together
     * @param {RecordingStep} step 
     * @returns 
     */
    async __handleFileDownloadProgressUpdate(step) {
        if (this.steps.length < 2 || step.command != 'waitForDownloadComplete') {
            return
        }
        let allSteps = this.steps
        let lastStepIndex = allSteps.length - 1

        //find out potentail file download update
        if (this.steps[lastStepIndex - 1].command != 'waitForDownloadComplete') {
            this.steps[lastStepIndex].functionAst.params[1].value += 1.5 * (this.steps[lastStepIndex].timeStamp - this.steps[lastStepIndex - 1].timeStamp)
            return
        }
        this.steps[lastStepIndex].functionAst.params[1].value += this.steps[lastStepIndex - 1].functionAst.params[1].value

        allSteps.splice(lastStepIndex - 1, 1)
    }
    /**
     * Check if there is previous step is a scroll from similar element,
     * If so, delete as we only need final scroll operation
     * We do this because scroll's x\y is absolute
     * @param {RecordingStep} step 
     * @returns 
     */
    async __handleScroll(step) {
        if (this.steps.length < 3 || step.command != 'scroll') {
            return
        }
        let allSteps = this.steps
        let lastStepIndex = allSteps.length - 1

        let i = lastStepIndex - 2
        let priorOperation = this.steps[i]
        if (priorOperation.command == 'scroll' && priorOperation.target == step.target) {
            allSteps.splice(i, 2)
        }

    }

    /**
     * delete action before upload
     * In recording mode, we will always do some action to trigger file upload
     * This is not necessary and the file chooser will cause issue to upcoming steps
     * In this case, we will delete previous step
     * This is unnecessary for manual adding mode because manual adding will never trigger 
     * file chooser
     * @param {RecordingStep} step 
     */
    async __handleFileUpload(step) {
        //this function is used to handle file upload
        if (this.steps.length < 3 || step.command != 'upload') {
            return
        }
        let allSteps = this.steps
        let lastStepIndex = allSteps.length - 1
        //convert arry of file names to a fully qualified file path strings seperated by ,
        let paramIndex = allSteps[lastStepIndex].functionAst.params.findIndex(item => { return item.type.name == 'Number' || item.type.name == 'string' || item.type.name == 'number' || item.type.name == 'Number' })
        let updatedFolderList = allSteps[lastStepIndex].functionAst.params[paramIndex].value.map(fileName => path.join(os.tmpdir(), fileName))
        let updatedFolderStr = updatedFolderList.join(',')
        allSteps[lastStepIndex].functionAst.params[paramIndex].value = updatedFolderStr


        //take the target from previous step because we use that spot as starting anchor to search for the input
        allSteps[lastStepIndex].target = allSteps[lastStepIndex - 2].target
        allSteps[lastStepIndex].potentialMatch = allSteps[lastStepIndex - 2].potentialMatch
        allSteps[lastStepIndex].finalLocator = allSteps[lastStepIndex - 2].finalLocator
        allSteps[lastStepIndex].finalLocatorName = allSteps[lastStepIndex - 2].finalLocatorName
        allSteps[lastStepIndex - 1].target = allSteps[lastStepIndex - 2].target
        allSteps[lastStepIndex - 1].potentialMatch = allSteps[lastStepIndex - 2].potentialMatch
        allSteps[lastStepIndex - 1].finalLocator = allSteps[lastStepIndex - 2].finalLocator
        allSteps[lastStepIndex - 1].finalLocatorName = allSteps[lastStepIndex - 2].finalLocatorName

        //delete the step that will invoke the file picker
        allSteps.splice(lastStepIndex - 3, 2)
    }
    /**
     * check if current command is change call and see if prior step is press key and timeout is small (0<x<100ms)
     * We do this because often times,change event will comes later than the press key event. We have to manually
     * reorder the steps to issue. We want to ensure timeout is greater than 0 as people might manually add command
     * And manual command will have timeout of 0
     * @param {RecordingStep} step 
     * @returns 
     */
    async __handleChangeNPressCombo(step) {
        if (this.steps.length >= 3 && step.command == 'change'
            && this.steps[this.steps.length - 3].command == 'keydown'
            && step.target == this.steps[this.steps.length - 3].target
            && this.steps[this.steps.length - 3].timeStamp - step.timeStamp < 50 //extremely short timeout to ensure they are two consequtive events
        ) {
            let waitStepForChange = this.steps[this.steps.length - 2]
            let actionStepForChange = this.steps[this.steps.length - 1]
            let actionStepForPress = this.steps[this.steps.length - 3]



            this.steps.splice(this.steps.length - 3, 3)
            this.steps.push(waitStepForChange)
            this.steps.push(actionStepForChange)
            this.steps.push(actionStepForPress)


        }
    }
    /**
     * If a keydown event trigger a click event, we will click event and associated wait
     * In login page, after user type in username and password, they might press enter key 
     * Developer might design their UI in a fashion that enter key will trigger the click event login button
     * Bluestone will capture both enter key and click event
     * This will break issue later in replay mode because press enter key will trigger click event in login button
     * and move us to next screen. For next step, the script will try to click login button again.
     * This will fail the script. In this case, the easiest way to handle this is get rid of 2nd click event
     * In this case, we will only trigger this if enter event and click event are right next to each other
     * @param {RecordingStep} step 
     * @returns 
     */
    async __handleEnterNClickCombo(step) {
        if (this.steps.length >= 3 && step.command == 'click'
            && this.steps[this.steps.length - 3].command == 'keydown'

            && Math.abs(step.timeStamp - this.steps[this.steps.length - 3].timeStamp) < 50 //extremly short timeout to ensure it is consecutive event
        ) {

            this.steps.splice(this.steps.length - 2, 2)
        }
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
            return item.selector == eventSelector && item.selector != ''
        })

        return potentialMatches
    }

    /**
     * Move step to specific place. If error is observed, return as is 
    * @param {string} fromIndex 
    * @param {number} targetIndex 
     */
    moveStepTo(fromIndex, toIndex) {
        try {
            fromIndex = Number.parseInt(fromIndex)
            let arr = this.steps
            toIndex = Number.parseInt(toIndex)
            //handle extreme case
            if (toIndex < 0) toIndex = 0
            if (toIndex >= arr.length) toIndex = arr.length - 1

            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
            this.steps = arr
        } catch (error) {

        }


    }


    /**
     * Based on the offset, update step sequence
    * @param {string} fromIndex 
    * @param {number} offset 
     */
    moveStepInArray(fromIndex, offset) {
        fromIndex = Number.parseInt(fromIndex)
        let toIndex = fromIndex + offset
        let arr = this.steps
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
        this.steps = arr
    }

    /**
     * returns the picture path for current step
     */
    getHtmlPath(fileName = null) {
        if (fileName == null) {
            fileName = Date.now().toString() + ".html"
        }
        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }
    /**
     * returns the picture path for current step
     */
    getPicPath(fileName = null) {
        if (fileName == null) {
            fileName = Date.now().toString() + ".png"
        }

        let filePath = path.join(__dirname, '../../../public/temp/componentPic', fileName)
        return filePath

    }
    /**
     * @param {string} relativeScriptPath path to the script file
     * @param {string} abosoluteResultPath path to the test result .json file
     * @returns {WorkflowRecord}
     */
    async loadTestcase(relativeScriptPath, abosoluteResultPath) {
        //get full script path
        let bluestonePath = process.env.bluestonePath
        let bluestoneFolder = path.dirname(bluestonePath)
        let bluestoneScriptFolder = path.join(bluestoneFolder, 'script')
        let tcName = relativeScriptPath
        //apend .js file name if it not included
        if (!relativeScriptPath.toLowerCase().endsWith('.js')) {
            relativeScriptPath += '.js'
        }
        let scriptPath = path.join(bluestoneScriptFolder, relativeScriptPath)

        //check if file exists
        try {
            await fs.access(scriptPath)
        } catch (error) {
            throw new Error(`Unable to find file at ${scriptPath}`)
        }


        let tcLoader = new TestcaseLoader(scriptPath, this.locatorManager, this.astManager)
        await tcLoader.parseTc(true)
        await tcLoader.copyStockLocatorPic(this.getPicPath)
        await tcLoader.getStepHealingInfo()
        await tcLoader.getIFrameInfo()
        //update test step information based on new files
        this.steps = tcLoader.steps
        //remove first initailize step
        this.steps.splice(0, 1)
        this.testSuiteName = tcLoader.testSuite
        this.testcaseName = tcLoader.testCase
        await this.updateTestStep(abosoluteResultPath, tcLoader)

    }
    /**
     * Based on the test step information, update auto-healing inforamtion
     * @param {string} testResultPath path to the mocha result file
     * @param {TestcaseLoader} tcLoader name of the testcase
     */
    async updateTestStep(testResultPath, tcLoader) {
        if (testResultPath == null) return
        let tcName = tcLoader.testCase
        try {
            //load test result file
            let resultBinary = await fs.readFile(testResultPath)
            let resultText = resultBinary.toString()
            let resultObj = JSON.parse(resultText)

            //navigate to the screenshot for the auto-healing steps
            let bluestonePath = process.env.bluestonePath
            let bluestoneFolder = path.dirname(bluestonePath)
            let bluestoneScriptFolder = path.join(bluestoneFolder, './result/', `./${resultObj.runId}/`)

            //attach the screenshot for current test
            let currentTestScreenshots = resultObj.screenshotManager.filter(item => item.tcId == tcName)
            for (let screenshotRecord of currentTestScreenshots) {
                //copy file to bluestone folder and make it ready for display
                let newPicPath = this.getPicPath()
                try {
                    await fs.copyFile(screenshotRecord.picPath, newPicPath)
                } catch (error) {
                    console.log(error)
                }

                //assign picture to right step
                let stepIndex = tcLoader.getStepIndexFromLine(screenshotRecord.lineNumber)
                this.steps[stepIndex].htmlPath = newPicPath
            }

            //if test failed, attach failure information to the step
            let currentFailureTc = resultObj.failures.find(item => item.title == tcName)
            let failureStepIndex = -1
            if (currentFailureTc != null) {
                let errorMessage = currentFailureTc.err.message
                let failureLine = getErrorStepIndexByErrorStack(currentFailureTc.file, currentFailureTc.err.stack)
                failureStepIndex = tcLoader.getStepIndexFromLine(failureLine)
                if (failureStepIndex == -1) {
                    failureStepIndex = 0
                }
                this.steps[failureStepIndex].result.isResultPass = false
                this.steps[failureStepIndex].result.resultText = errorMessage
                this.steps[failureStepIndex].isRequiredLocatorUpdate = true
            }
            // Make all steps pass till we hit failure
            for (let i = 0; i < this.steps.length; i++) {
                if (i == failureStepIndex) {
                    break
                }
                this.steps[i].result.isResultPass = true
            }



            //identify prescription screenshot and assign it to the step
            let currentTc = resultObj.reviews.find(item => item.title == tcName)
            //current test is passed... no more inforamtion to pass
            if (currentTc == null) {
                return
            }
            for (let prescription of currentTc.prescription) {
                let newPicPath = this.getPicPath()
                let sourcePicPath = path.join(bluestoneScriptFolder, prescription.newLocatorSnapshotPath)
                try {
                    await fs.copyFile(sourcePicPath, newPicPath)
                } catch (error) {
                    console.log(error)
                }


                //convert to stepIndex
                let failedStepIndex = tcLoader.getStepIndexFromLine(prescription.failureStepIndex)
                this.steps[failedStepIndex].isRequiredReview = true
                //populate screenshot picture

                this.steps[failedStepIndex].htmlPath = newPicPath
                //update locator to proposed value
                this.steps[failedStepIndex].finalLocator = [prescription.newLocator]
                this.steps[failedStepIndex].target = prescription.newLocator
            }
            console.log()
        } catch (error) {
            console.log('')
        }
    }
}

module.exports = { WorkflowRecord, RecordingStep, COMMAND_TYPE }