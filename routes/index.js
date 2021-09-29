var express = require('express');
var router = express.Router();
const { WorkflowRecord } = require('../controller/record/class/index')
const PugWorkflow = require('../controller/ui/class/Workflow')
const { hideSpy, runCurrentOperation } = require('../controller/puppeteer/index')
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
  workflow.updateUserInputForSpy(req.query)
  let variables = {
    workflow: workflow.getWorkflowForPug(),
    removeWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnRemoveWorkflowStep,
    upWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowUp,
    downWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnMoveWorkflowDown,
    editWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnEditWorkflow,
    locatorWorkflowQueryKey: PugWorkflow.inBuiltQueryKey.btnLocatorWorkflow
  }
  if (req.query[PugWorkflow.inBuiltQueryKey.btnEditWorkflow]) {
    //if we are editing current workflow, we will redirect back to spy page
    res.redirect('/spy')
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
  workflow.updateUserInputForSpy(req.query)

  let variables = {
  }
  res.render('locatorDefiner.pug', variables);

})
router.get('/locator-manager', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  workflow.updateUserInputForSpy(req.query)

  let variables = {
  }
  res.render('locatorManager.pug', variables);

})
router.get('/locator-definer-sidebar', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  workflow.updateUserInputForSpy(req.query)

  let variables = {

  }
  res.render('locatorDefinerSidebar.pug', variables);

})
router.get('/spy', async function (req, res, next) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  workflow.updateUserInputForSpy(req.query)
  if (req.app.locals.puppeteerControl) {
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
