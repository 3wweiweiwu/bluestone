const { Page } = require('puppeteer')
const { RecordingStep } = require('../../record/class')
class AlertWatcher {
    /**
     * 
     * @param {import('../../record/class').WorkflowRecord} record add step function to add recording step
     * @param {Page} page
     * @param {Function} logEvent
     */
    constructor(record, page, logEvent) {
        this.record = record
        this.page = page
        this.logEvent = logEvent
    }
    startWatching() {
        let record = this.record
        let logEvent = this.logEvent
        this.page.on('dialog', async dialog => {

            let step = new RecordingStep({
                command: 'waitAndHandleForAlert',
                target: record.operation.browserSelection.currentSelector,
                iframe: '[]',
            })
            let elaspedTime = Date.now() - record.operation.browserSelection.lastOperationTime
            if (elaspedTime < 2000) {
                elaspedTime = 2000
            }
            step.timeStamp = Date.now()
            step.timeoutMs = elaspedTime
            step.parameter = elaspedTime
            step.potentialMatch = record.operation.browserSelection.potentialMatch
            step.targetPicPath = record.operation.browserSelection.selectorPicture
            logEvent(record)(step)
        })
    }
}

module.exports = AlertWatcher