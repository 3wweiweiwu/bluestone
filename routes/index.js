var express = require('express');
var router = express.Router();
const { WorkflowRecord } = require('../controller/record/class/index')

/* GET home page. */
router.get('/spy', function (req, res, next) {
  /**
   * @type {import('../controller/record/class/index.js').WorkflowRecord}
   */
  let workflow = req.app.locals.workflow
  workflow.updateUserInputForSpy(req.query)
  let variables = {
    title: 'Express',
    groups: workflow.getSpyGroupsInfoForPug(),
    operations: workflow.getOperationInfoForPug(),
    argumentList: workflow.getArgumentsInfoForPug(),
    currentSelector: workflow.ui.spy.browserSelection.currentSelector,
    currentGroup: workflow.getCurrentGroupText(),
    currentOperation: workflow.getCurrentOperationText(),
    argumentsQueryKey: WorkflowRecord.inbuiltQueryKey.currentArgument,
    argumentsQueryIndex: WorkflowRecord.inbuiltQueryKey.currentArgumentIndex,
    btnAddStepValidation: workflow.ui.spy.validation.btnAddStep,
    addStepQueryKey: WorkflowRecord.inbuiltQueryKey.btnAddStep,
    cancelQueryKey: WorkflowRecord.inbuiltQueryKey.btnCancel
  }

  res.render('spy.pug', variables);
});

module.exports = router;
