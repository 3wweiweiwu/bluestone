const { WorkflowRecord } = require('../../record/class/index')

/**
 * Log element where mouse point to the workflow recorder element
 * @param {WorkflowRecord} recordRepo 
 */
module.exports = function (recordRepo) {

    return function (selector = '', innerText = '', x, y, height, width) {
        if (recordRepo.isRecording) {

            recordRepo.operation.browserSelection.currentSelector = selector
            recordRepo.operation.browserSelection.currentInnerText = innerText
            recordRepo.operation.browserSelection.x = x
            recordRepo.operation.browserSelection.y = y
            recordRepo.operation.browserSelection.height = height
            recordRepo.operation.browserSelection.width = width
            recordRepo.operation.browserSelection.lastOperationTimeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime
        }

    }
}