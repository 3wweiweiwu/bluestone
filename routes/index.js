var express = require('express');
var router = express.Router();
const { WorkflowRecord } = require('../controller/record/class/index')
const { hideSpy, runCurrentOperation } = require('../controller/puppeteer/index')
/* GET home page. */
router.get('/', async function (req, res) {
  res.render('index.pug');
})
router.get('/workflow', async function (req, res) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  let variables = {
    workflow: workflow.getWorkflowForPug()
  }
  res.render('workflow.pug', variables);
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
