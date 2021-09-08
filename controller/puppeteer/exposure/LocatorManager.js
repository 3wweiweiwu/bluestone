const { RecordingStep, COMMAND_TYPE, WorkflowRecord } = require('../../record/class/index')

const jimp = require('jimp')
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
function setLocatorStatus(recordRepo) {
    /**
     * Log browser event to the cache
     * @param {import('../../record/class').RecordingStep} eventDetail 
     */
    async function setLocatorToBluestone(locatorStatus) {
        return recordRepo.locatorManager.locatorLibrary = locatorStatus
    }
    return setLocatorToBluestone
}

module.exports = { getLocator, setLocatorStatus }