const { RecordingStep, COMMAND_TYPE, WorkflowRecord } = require('../../record/class/index')

/**
 * 
 * @param {import('../../record/class/index').WorkflowRecord} recordRepo 
 * @param {import('puppeteer-core').Page} page
 * @param {import('socket.io').Server} io
 */
function getLocator(recordRepo) {
    /**
     * Log browser event to the cache
     * @param {import('../../record/class').RecordingStep} eventDetail 
     */
    async function getLocatorsFromBluestone() {
        return recordRepo.locatorManager.locatorLibrary
    }
    return getLocatorsFromBluestone
}
/**
 * 
 *  @param {import('../../record/class/index').WorkflowRecord} recordRepo 
 * @returns 
 */
function setLocatorStatus(recordRepo) {
    /**
     * Set specific locator to be active
     * @param {Array<number>} activeIndexes 
     */
    async function setLocatorToBluestone(activeIndexes) {
        recordRepo.locatorManager.setActiveLocator(activeIndexes)


    }
    return setLocatorToBluestone
}

module.exports = { getLocator, setLocatorStatus }