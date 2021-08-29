const { RecordingStep } = require('../../record/class/index')
/**
 * 
 * @param {import('../../record/class/index').WorkflowRecord} recordRepo 
 * @param {import('puppeteer-core').Page} page
 */
module.exports = function (recordRepo, page) {
    /**
     * Log browser event to the cache
     * @param {import('../../record/class').RecordingStep} eventDetail 
     */
    function logEvent(eventDetail) {

        //if event command is null, call the in-browser console
        if (eventDetail.command == null) {
            recordRepo.isRecording = false
            //add current event to the recorder
            page.screenshot({
                path: 'hello1.png', clip: {
                    x: recordRepo.ui.spy.browserSelection.x,
                    y: recordRepo.ui.spy.browserSelection.y,
                    height: recordRepo.ui.spy.browserSelection.height,
                    width: recordRepo.ui.spy.browserSelection.width
                }
            })
                .catch(err => {
                    console.log(err)
                })


            console.log('pause recording and call in-browser agent')

        }
        if (recordRepo.isRecording) {
            let event = new RecordingStep(eventDetail)
            recordRepo.addStep(event)
            console.log(JSON.stringify(recordRepo.steps))
        }

    }
    return logEvent
}

