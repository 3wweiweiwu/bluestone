const { RecordingStep, COMMAND_TYPE } = require('../../record/class/index')

const jimp = require('jimp')
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
    async function logEvent(eventDetail) {

        //goto command does not generate a locator, we w

        let picturePath = ''
        //handle screenshot
        if (page != null) {
            picturePath = recordRepo.getPicPath()
            page.screenshot({ path: picturePath, captureBeyondViewport: false })
                .then(() => {
                    if (eventDetail.command == COMMAND_TYPE.goto) return Promise.reject('GOTO')
                    return jimp.read(picturePath)
                })
                .then(pic => {
                    return pic.crop(eventDetail.pos.x, eventDetail.pos.y, eventDetail.pos.width, eventDetail.pos.height);
                })
                .then(pic => {
                    return pic.writeAsync(picturePath)
                })
                .catch(err => {
                    console.log(err)
                })
        }


        //if event command is null, call the in-browser console
        if (eventDetail.command == null) {
            recordRepo.spyBrowserSelectionPicPath = picturePath
            recordRepo.isRecording = false
            console.log('pause recording and call in-browser agent')

        }
        if (recordRepo.isRecording) {
            eventDetail.targetPicPath = picturePath
            let event = new RecordingStep(eventDetail)
            recordRepo.addStep(event)
            console.log(JSON.stringify(recordRepo.steps))
        }

    }
    return logEvent
}

