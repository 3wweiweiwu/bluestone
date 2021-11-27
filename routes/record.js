var express = require('express');
var router = express.Router();
const puppeteerControl = require('../controller/puppeteer')

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
module.exports = router;
