var express = require('express');
var router = express.Router();
const puppeteerControl = require('../controller/puppeteer')
const config = require('../config');
const { route } = require('.');

/* Start Recording. */
router.post('/record', async function (req, res) {

    let recordObj = await puppeteerControl.startRecording(req.app.locals.workflow, req.app.locals.io, req.body.url)
    req.app.locals.puppeteerControl.browser = recordObj.browser
    req.app.locals.puppeteerControl.page = recordObj.page
    res.json()
});
// stop recording
router.delete('/record', async function (req, res) {
    await puppeteerControl.endRecording(req.app.locals.puppeteerControl.browser)

    res.json()
});

router.put('/record', async function (req, res) {
    /**@type {import('../controller/record/class/index').WorkflowRecord} */
    let workflow = req.app.locals.workflow
    try {
        await workflow.loadTestcase(req.body.relativePath)
        //get first url within the website
        let gotoStep = workflow.steps.find(element => element.command == 'goto')

        let recordObj = await puppeteerControl.startRecording(req.app.locals.workflow, req.app.locals.io, gotoStep.parameter[1].value, false)
        req.app.locals.puppeteerControl.browser = recordObj.browser
        req.app.locals.puppeteerControl.page = recordObj.page

        res.json()
    } catch (error) {
        res.status(500).json(error)
    }


})
module.exports = router;
