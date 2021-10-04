const { RecordingStep, COMMAND_TYPE, WorkflowRecord } = require('../../record/class/index')
const config = require('../../../config')
const jimp = require('jimp')
const path = require('path')
const fs = require('fs').promises
const openBluestoneTab = require('../../puppeteer/activities/openBluestoneTab')
const Operation = require('../../puppeteer/class/index')
/**
 * 
 * @param {import('../../record/class/index').WorkflowRecord} recordRepo 
* @param {import('puppeteer-core').Browser} browser 
* @param {import('puppeteer-core').Page} page
 * @param {import('socket.io').Server} io
 */
module.exports = function (recordRepo, browser, page, io) {

    /**
     * Log browser event to the cache
     * @param {import('../../record/class').RecordingStep} eventDetail 
     */
    async function logEvent(eventDetail) {

        //goto command does not generate a locator, we w


        //handle page capture
        let htmlPath = ''
        if (page != null) {
            htmlPath = recordRepo.getHtmlPath()
            let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {

                const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
                return pageData;
            }, config.singlefile);
            fs.writeFile(htmlPath, pageData.content)

        }
        //handle screenshot
        let picturePath = ''
        if (page != null) {
            picturePath = recordRepo.getPicPath()
            await page.screenshot({ path: picturePath, captureBeyondViewport: false })
            if (eventDetail.command == COMMAND_TYPE.goto) return Promise.reject('GOTO')
            let pic = await jimp.read(picturePath)
            if (eventDetail.command == null) {
                //for in-browser agent call
                pic = pic.crop(recordRepo.operation.browserSelection.x, recordRepo.operation.browserSelection.y, recordRepo.operation.browserSelection.width, recordRepo.operation.browserSelection.height);
            }
            else {
                //for ordinary event, just crop as usual
                pic = pic.crop(eventDetail.pos.x, eventDetail.pos.y, eventDetail.pos.width, eventDetail.pos.height);
            }
            await pic.writeAsync(picturePath)

        }


        //if event command is null, call the in-browser console
        if (eventDetail.command == null) {
            recordRepo.spyBrowserSelectionPicPath = picturePath
            recordRepo.isRecording = false
            recordRepo.spyBrowserSelectionHtmlPath = htmlPath
            console.log('pause recording and call in-browser agent')
            recordRepo.spyVisible = true
            //populate group info
            try {
                //TODO: This function is causing performance issue
                await recordRepo.refreshActiveFunc()

            } catch (error) {
                recordRepo.operation.spy.result.isPass = false
                recordRepo.operation.spy.result.text = `Unable to load bluestone-func.js: ${error.toString()}`
            }

            //display mvt console
            await openBluestoneTab(browser, "spy")


        }
        if (recordRepo.isRecording) {
            //If we don't have page element, this indicates that it is a non-UI operation,
            //we will not calculate timeout
            let timeoutMs = null
            if (page != null) {
                timeoutMs = Date.now() - recordRepo.operation.browserSelection.lastOperationTime
            }
            eventDetail.timeoutMs = timeoutMs
            //calculate timeout by subtracting current time to the time from previous step

            eventDetail.targetPicPath = picturePath
            eventDetail.htmlPath = htmlPath

            //construct operation event
            let event = new RecordingStep(eventDetail)
            try {
                let commandFuncAst = recordRepo.astManager.getFunction(event.command)
                event.functionAst = commandFuncAst
                //parse in argument into parameter
                if (eventDetail.parameter && eventDetail.parameter != '') {
                    let paramIndex = event.functionAst.params.findIndex(item => { return item.type.name == 'Number' || item.type.name == 'string' || item.type.name == 'number' || item.type.name == 'Number' })
                    event.functionAst.params[paramIndex].value = eventDetail.parameter
                }
            } catch (error) {
                console.log(`Cannot find command ${event.command}`)
            }


            await recordRepo.addStep(event)

            console.log(JSON.stringify(recordRepo.steps))
            //update last operation time
        }

        setTimeout(() => {
            try {
                if (io) io.emit(WorkflowRecord.inbuiltEvent.refresh)
            } catch (error) {
                console.log(error)
            }
        }, 800);


    }
    return logEvent
}

