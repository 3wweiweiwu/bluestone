const { RecordingStep } = require('../../record/class')
/**
 * 
 * @param {import('../../record/class/index').WorkflowRecord} recordRepo 
 */
module.exports = function (recordRepo) {
    /**
     * Log browser event to the cache
     * @param {import('../../record/class').RecordingStep} eventDetail 
     */
    function logEvent(eventDetail) {
        // let closetLocator = findClosestLocator(activeLocatorElements, eventDetail)
        let event = new RecordingStep(eventDetail)
        recordRepo.addStep(event)
        console.log(JSON.stringify(recordRepo))

    }
    return logEvent
}

