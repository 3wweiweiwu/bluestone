const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')
const ElementSelector = require('../../../ptLibrary/class/ElementSelector')

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
            io.emit(WorkflowRecord.inbuiltEvent.refresh)
        }
    }
    return async function () {
        recordRepo.runCurrentOperation = false
        recordRepo.spyVisible = false
        //get curren toperation
        let currentOperation = recordRepo.getCurrentOperation()
        //hide spy window
        let spyElement = await page.$('#bluestone_inbrowser_console')
        await spyElement.evaluate((el) => el.style.display = 'none');
        page.waitForTimeout(500)




        //refresh page

        //eval tex
        //construct argment for the function
        let currentScope = {}
        let currentParam = []
        for (let i = 0; i < currentOperation.params.length; i++) {
            let param = currentOperation.params[i]
            //construct scope
            switch (param.typeName.name) {
                case "Page":
                    currentScope['page'] = page
                    currentParam.push('page')
                    break;
                case "Browser":
                    currentScope['browser'] = browser
                    currentParam.push('browser')
                    break;
                case "ElementSelector":
                    let currentSelector = recordRepo.ui.spy.browserSelection.currentSelector
                    let elementSelector = new ElementSelector([currentSelector], '', 'Selected UI element')
                    currentParam.push('elementSelector')
                    currentScope['elementSelector'] = elementSelector
                    break;
                case "String":
                    break;
                case "string":
                    currentParam.push(`"${param.value}"`)
                    break;
                case "number":
                    currentParam.push(`${param.value}`)
                    break
                default:
                    break;
            }
        }

        let argumentStr = currentParam.join(',')
        currentScope['mainFunc'] = currentOperation.mainFunc
        let res = _eval(`
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
                recordRepo.ui.spy.result.text = res.res
                break
            }
            if (res.err != null) {
                recordRepo.ui.spy.result.text = res.err
                break
            }
        }
        recordRepo.spyVisible = true
        //show spy window again
        refreshSpy()
        page.waitForTimeout(500)
        await spyElement.evaluate((el) => el.style.display = 'block');

    }
}