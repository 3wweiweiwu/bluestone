const { RecordingStep, COMMAND_TYPE, WorkflowRecord } = require('../../record/class/index')
const config = require('../../../config')
const path = require('path')
const fs = require('fs').promises
const os = require('os')
const openBluestoneTab = require('../../puppeteer/activities/openBluestoneTab')
const { drawPendingWorkProgress } = require('../../puppeteer/activities/drawPendingWorkProgress')
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

        //handle locator potential match
        let locatorPotentialMatch = []
        try {
            let matchedList = JSON.parse(eventDetail.potentialMatch)
            for (index of matchedList) {
                let locatorObj = JSON.parse(JSON.stringify(recordRepo.locatorManager.locatorLibrary[index]))
                locatorPotentialMatch.push(locatorObj)
            }


        } catch (error) {

        }
        //handle frame potential match
        let framePotentialMatch = []
        try {
            let matchedList = JSON.parse(eventDetail.framePotentialMatch)
            for (index of matchedList) {
                let locatorObj = JSON.parse(JSON.stringify(recordRepo.locatorManager.locatorLibrary[index]))
                framePotentialMatch.push(locatorObj)
            }


        } catch (error) {

        }
        //handle page capture

        let htmlPath = ''
        // if (page != null) {
        // htmlPath = recordRepo.getHtmlPath()
        // recordRepo.htmlCaptureStatus.outputHtml(htmlPath)
        // }
        //handle screenshot

        let picturePath = ''



        if (page != null) {
            picturePath = recordRepo.getPicPath()

            if (eventDetail.target == '') {
                //handle those element that will be destroyed right after interaaction
                picturePath = recordRepo.operation.browserSelection.selectorPicture
                locatorPotentialMatch = recordRepo.operation.browserSelection.potentialMatch
            }
            else {
                //handle 2 scenario, if current event is gone before we capture that, we will just use last mouse position
                if (eventDetail.command == null || (eventDetail.pos.x == 0 && eventDetail.pos.y == 0)) {
                    //for operation coming custozied operation
                    recordRepo.picCapture.outputCurrentPic(recordRepo.operation.browserSelection.x, recordRepo.operation.browserSelection.y, recordRepo.operation.browserSelection.width, recordRepo.operation.browserSelection.height, picturePath);
                }
                else {
                    //for ordinary event, just crop as usual
                    recordRepo.picCapture.outputCurrentPic(eventDetail.pos.x, eventDetail.pos.y, eventDetail.pos.width, eventDetail.pos.height, picturePath);
                }

            }
        }
        //in case the element is destroyed after the event, we will get the locator from last hovered element
        if (eventDetail.target == null || eventDetail.target == '') {
            eventDetail.target = recordRepo.operation.browserSelection.currentSelector
        }


        //if event command is null, call the in-browser console
        if (eventDetail.command == null) {
            recordRepo.isCaptureHtml = false

            recordRepo.spyBrowserSelectionPicPath = picturePath
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

            //display pending work progress
            await drawPendingWorkProgress(page, recordRepo.picCapture, recordRepo.htmlCaptureStatus)
            //display mvt console
            await openBluestoneTab(browser, "decide-view")

            //give 500ms delay so that it can capture unfinished events(ex: last change event)
            setTimeout(() => {
                recordRepo.isRecording = false
                recordRepo.isCaptureHtml = true
            }, 500)


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
            eventDetail.potentialMatch = locatorPotentialMatch
            eventDetail.framePotentialMatch = framePotentialMatch
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
            if (eventDetail.currentSelectedIndex) {
                let selectedLocator = recordRepo.locatorManager.locatorLibrary[eventDetail.currentSelectedIndex]
                event.finalLocatorName = selectedLocator.path
                event.finalLocator = selectedLocator.Locator
            }


            await recordRepo.addStep(event)
            // console.log(JSON.stringify(recordRepo.steps))
            //update last operation time
        }

        // setTimeout(() => {
        //     try {
        //         if (io) io.emit(WorkflowRecord.inbuiltEvent.refresh)
        //     } catch (error) {
        //         console.log(error)
        //     }
        // }, 800);


    }
    return logEvent
}