const { WorkflowRecord } = require('../../record/class/index')
/**
 * tell browser if we are still recordng
 * @param {WorkflowRecord} recordRepo 
 */
module.exports = function (recordRepo) {
    return function () {
        return recordRepo.spyVisible
    }
}