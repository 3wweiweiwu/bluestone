var express = require('express');
var router = express.Router();
const { WorkflowRecord } = require('../controller/record/class/index')
const PugWorkflow = require('../controller/ui/class/Workflow')
const PugLocatorDefiner = require('../controller/ui/class/LocatorDefiner')
const { hideSpy, runCurrentOperation } = require('../controller/puppeteer/index')
const checkLocatorInDefiner = require('../controller/puppeteer/activities/checkLocatorInDefiner')
const config = require('../config')
const Operation = require('../controller/ui/class/Operation')
const UI = require('../controller/ui')
/* GET home page. */
router.get('/', async function (req, res) {
  res.render('index.pug');
})
router.get('/workflow', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  /**@type {UI} */
  let ui = req.app.locals.ui
  await ui.updateUserInputForSpy(req.query)
  let variables = {
    workflow: ui.workflow.getWorkflowForPug(),
    removeWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnRemoveWorkflowStep,
    upWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowUp,
    downWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowDown,
    editWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnEditWorkflow,
    locatorWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnLocatorWorkflow,
    btnResolveLocatorQueryKey: PugWorkflow.inBuiltQueryKey.btnResolveLocatorQueryKey,
    btnCreateTestcaseQueryKey: PugWorkflow.inBuiltQueryKey.btnCreateTestcaseQueryKey,
    txtTestSuiteQueryKey: PugWorkflow.inBuiltQueryKey.txtTestSuiteQueryKey,
    txtTestCaseQueryKey: PugWorkflow.inBuiltQueryKey.txtTestCaseQueryKey,
    textTestSuiteValue: ui.workflow.textTestSuiteValue,
    textTestCaseValue: ui.workflow.textTestCaseValue,
    txtValidationStatus: ui.workflow.txtValidationStatus
  }
  if (req.query[PugWorkflow.inBuiltQueryKey.btnEditWorkflow]) {
    //if we are editing current workflow, we will `redirect` back to spy page
    res.redirect('/spy')
  }
  else if (req.query[PugWorkflow.inBuiltQueryKey.btnLocatorWorkflow]) {
    res.redirect('/locator-definer')
  }
  else {
    //otherwise, continue with workflow page
    res.render('workflow.pug', variables);
  }

})
router.get('/locator-definer', async function (req, res) {
  /**
   * @type {UI}
   */
  let ui = req.app.locals.ui

  await ui.updateUserInputForSpy(req.query)



  let variables = {
    locatorHtml: ui.locatorDefiner.locatorHtml
  }
  res.render('locatorDefiner.pug', variables);

})

router.get('/locator-definer-sidebar', async function (req, res) {

  /**@type {UI} */
  let ui = req.app.locals.ui
  await ui.updateUserInputForSpy(req.query)

  let variables = {
    revertQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnRevert,
    txtLocatorQueryKey: PugLocatorDefiner.inBuiltQueryKey.txtLocator,
    txtLocatorNameQueryKey: PugLocatorDefiner.inBuiltQueryKey.txtLocatorName,
    btnCheckQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnConfirm,
    txtLocatorValue: ui.locatorDefiner.locatorSelector,
    txtLocatorName: ui.locatorDefiner.locatorName,
    possibleLocatorMatch: ui.locatorDefiner.possibleLocators,
    possibleLocatorOkQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnLocatorOk,
    validationText: ui.locatorDefiner.validationText
  }

  res.render('locatorDefinerSidebar.pug', variables);

})
router.get('/spy', async function (req, res, next) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow

  /**@type {UI} */
  let ui = req.app.locals.ui


  await ui.updateUserInputForSpy(req.query)
  if (req.app.locals.puppeteerControl.page) {
    hideSpy(req.app.locals.puppeteerControl.page, workflow.spyVisible)
    runCurrentOperation(req.app.locals.puppeteerControl.page, workflow.runCurrentOperation)
  }

  let variables = {
    title: 'Express',
    groups: ui.operation.getSpyGroupsInfoForPug(),
    operations: ui.operation.getOperationInfoForPug(),
    argumentList: ui.operation.getArgumentsInfoForPug(),
    currentSelector: ui.operation.browserSelection.currentSelector,
    currentSelectorPic: ui.operation.getSpySelectorPictureForPug(),
    currentGroup: ui.operation.getCurrentGroupText(),
    currentOperation: ui.operation.getCurrentOperationText(),
    argumentsQueryKey: Operation.inbuiltQueryKey.currentArgument,
    argumentsQueryIndex: Operation.inbuiltQueryKey.currentArgumentIndex,
    btnAddStepValidation: ui.operation.spy.validation.btnAddStep,
    addStepQueryKey: Operation.inbuiltQueryKey.btnAddStep,
    cancelQueryKey: Operation.inbuiltQueryKey.btnCancel,
    runQueryKey: Operation.inbuiltQueryKey.btnRun,
    result: ui.operation.operationResult
  }

  res.render('spy.pug', variables);
});

module.exports = router;
