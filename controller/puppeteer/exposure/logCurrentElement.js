const { WorkflowRecord } = require('../../record/class/index')

/**
 * Log element where mouse point to the workflow recorder element
 * @param {WorkflowRecord} recordRepo 
 */
module.exports = function (recordRepo) {

    return function (selector = '', innerText = '', x, y, height, width) {
        if (recordRepo.isRecording) {
            recordRepo.ui.spy.browserSelection.currentSelector = selector
            recordRepo.ui.spy.browserSelection.currentInnerText = innerText
            recordRepo.ui.spy.browserSelection.x = x
            recordRepo.ui.spy.browserSelection.y = y
            recordRepo.ui.spy.browserSelection.height = height
            recordRepo.ui.spy.browserSelection.width = width
            recordRepo.ui.spy.browserSelection.lastOperationTimeoutMs = Date.now() - recordRepo.ui.spy.browserSelection.lastOperationTime
        }

    }
}