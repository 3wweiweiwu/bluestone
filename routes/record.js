var express = require('express');
var router = express.Router();
const puppeteerControl = require('../controller/puppeteer')
const config = require('../config')

/* GET home page. */
router.post('/record', async function (req, res) {

    let recordObj = await puppeteerControl.startRecording(req.app.locals.workflow, req.app.locals.io, req.body.url)
    req.app.locals.puppeteerControl.browser = recordObj.browser
    req.app.locals.puppeteerControl.page = recordObj.page
    res.json()
});
router.delete('/record', async function (req, res) {
    await puppeteerControl.endRecording(req.app.locals.puppeteerControl.browser)

    res.json()
});
router.post('/compile', async function (req, res) {
    try {
        await req.app.locals.workflow.astManager.loadFunctions(config.code.funcPath)
        res.json()
    } catch (error) {
        res.status(400).json(error)
    }
});
module.exports = router;
