var express = require('express');
var router = express.Router();
const { WorkflowRecord } = require('../controller/record/class/index')
const PugWorkflow = require('../controller/ui/class/Workflow')
const PugLocatorDefiner = require('../controller/ui/class/LocatorDefiner')
const { hideSpy, runCurrentOperation } = require('../controller/puppeteer/index')
const checkLocatorInDefiner = require('../controller/puppeteer/activities/checkLocatorInDefiner')
const config = require('../config')
/* GET home page. */
router.get('/', async function (req, res) {
  res.render('index.pug');
})
router.get('/workflow', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  await workflow.updateUserInputForSpy(req.query)
  let variables = {
    workflow: workflow.getWorkflowForPug(),
    removeWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnRemoveWorkflowStep,
    upWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowUp,
    downWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowDown,
    editWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnEditWorkflow,
    locatorWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnLocatorWorkflow,
    btnResolveLocatorQueryKey: PugWorkflow.inBuiltQueryKey.btnResolveLocatorQueryKey,
    btnCreateTestcaseQueryKey: PugWorkflow.inBuiltQueryKey.btnCreateTestcaseQueryKey,
    txtTestSuiteQueryKey: PugWorkflow.inBuiltQueryKey.txtTestSuiteQueryKey,
    txtTestCaseQueryKey: PugWorkflow.inBuiltQueryKey.txtTestCaseQueryKey,
    textTestSuiteValue: workflow.workflowPug.textTestSuiteValue,
    textTestCaseValue: workflow.workflowPug.textTestCaseValue,
    txtValidationStatus: workflow.workflowPug.txtValidationStatus
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
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  await workflow.updateUserInputForSpy(req.query)



  let variables = {
    locatorHtml: workflow.locatorDefinerPug.locatorHtml
  }
  res.render('locatorDefiner.pug', variables);

})
router.get('/locator-manager', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  await workflow.updateUserInputForSpy(req.query)

  let variables = {
  }
  res.render('locatorManager.pug', variables);

})
router.get('/locator-definer-sidebar', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  await workflow.updateUserInputForSpy(req.query)
  if (workflow.locatorDefinerPug.validateCurrentLocator) {
    workflow.locatorDefinerPug.validateCurrentLocator = false
    //TODO: hook up the result and move this to locator definer class
    await checkLocatorInDefiner(req.app.locals.puppeteerControl.browser, workflow.locatorDefinerPug.locatorSelector)
  }
  let variables = {
    revertQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnRevert,
    txtLocatorQueryKey: PugLocatorDefiner.inBuiltQueryKey.txtLocator,
    txtLocatorNameQueryKey: PugLocatorDefiner.inBuiltQueryKey.txtLocatorName,
    btnCheckQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnConfirm,
    txtLocatorValue: workflow.locatorDefinerPug.locatorSelector,
    txtLocatorName: workflow.locatorDefinerPug.locatorName,
    possibleLocatorMatch: workflow.locatorDefinerPug.possibleLocators,
    possibleLocatorOkQueryKey: PugLocatorDefiner.inBuiltQueryKey.btnLocatorOk,
    validationText: workflow.locatorDefinerPug.validationText
  }

  res.render('locatorDefinerSidebar.pug', variables);

})
router.get('/spy', async function (req, res, next) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  await workflow.updateUserInputForSpy(req.query)
  if (req.app.locals.puppeteerControl.page) {
    hideSpy(req.app.locals.puppeteerControl.page, workflow.spyVisible)
    runCurrentOperation(req.app.locals.puppeteerControl.page, workflow.runCurrentOperation)
  }

  let variables = {
    title: 'Express',
    groups: workflow.getSpyGroupsInfoForPug(),
    operations: workflow.getOperationInfoForPug(),
    argumentList: workflow.getArgumentsInfoForPug(),
    currentSelector: workflow.ui.spy.browserSelection.currentSelector,
    currentSelectorPic: workflow.getSpySelectorPictureForPug(),
    currentGroup: workflow.getCurrentGroupText(),
    currentOperation: workflow.getCurrentOperationText(),
    argumentsQueryKey: WorkflowRecord.inbuiltQueryKey.currentArgument,
    argumentsQueryIndex: WorkflowRecord.inbuiltQueryKey.currentArgumentIndex,
    btnAddStepValidation: workflow.ui.spy.validation.btnAddStep,
    addStepQueryKey: WorkflowRecord.inbuiltQueryKey.btnAddStep,
    cancelQueryKey: WorkflowRecord.inbuiltQueryKey.btnCancel,
    runQueryKey: WorkflowRecord.inbuiltQueryKey.btnRun,
    result: workflow.ui.spy.result
  }

  res.render('spy.pug', variables);
});

module.exports = router;
