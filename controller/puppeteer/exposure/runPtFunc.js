const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')
const openBluestoneTab = require('../activities/openBluestoneTab')
const Operation = require('../../puppeteer/class/index')
const _eval = require('eval')
/**
 * Run current operation
 * @param {WorkflowRecord} recordRepo 
 * @param {Page} page 
 * @param {Browser} browser 
 */
module.exports = function (recordRepo, browser, page, io) {
    function refreshSpy() {
        if (io) {
            io.emit(Operation.inbuiltEvent.refresh)
        }
    }
    return async function () {
        recordRepo.runCurrentOperation = false
        recordRepo.spyVisible = false
        //get curren toperation
        //TODO: fix currrent operation so that we can run testcase correctly
        let currentOperation = recordRepo.getCurrentOperation()
        //hide spy window
        let spyElement = await page.$('#bluestone_inbrowser_console')

        page.bringToFront()
        page.waitForTimeout(500)




        //refresh page

        //eval tex
        let currentSelector = recordRepo.ui.spy.browserSelection.currentSelector
        let argumentNContext = currentOperation.generateArgumentNContext(browser, page, currentSelector)
        let argumentStr = argumentNContext.argumentStr
        let currentScope = argumentNContext.currentScope
        currentScope['mainFunc'] = currentOperation.mainFunc

        let res = null
        try {
            res = _eval(`
            mainFunc(${argumentStr})
                            .then(result => {
                                exports.res = result

                            })
                            .catch(err => {
                                console.log(err)
                                exports.err = err
                            })
                            `, 'runPtFunc.js', currentScope, false)
            //wait till execution is completed
            while (true) {
                await page.waitForTimeout(1000)
                if (res.res != null) {
                    recordRepo.ui.spy.result.isPass = true
                    recordRepo.ui.spy.result.text = res.res
                    break
                }
                if (res.err != null) {
                    recordRepo.ui.spy.result.isPass = false
                    recordRepo.ui.spy.result.text = res.err
                    break
                }
            }
        } catch (error) {
            recordRepo.ui.spy.result.isPass = false
            recordRepo.ui.spy.result.text = `Error during runPtFunc.js: ${error.toString()}`
        }
        recordRepo.spyVisible = true
        //show spy window again
        refreshSpy()
        page.waitForTimeout(500)
        await openBluestoneTab(browser, 'spy')

    }
}