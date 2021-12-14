var express = require('express');
const { Browser } = require('puppeteer-core');
const UI = require('../controller/ui')
var router = express.Router();
router.get('/steps', async function (req, res) {
    /**@type {UI} */
    let ui = req.app.locals.ui
    res.json(JSON.stringify(ui.backend.steps))
})
router.get('/backend-operation', async function (req, res) {
    /**@type {UI} */
    let ui = req.app.locals.ui

    res.json(ui.operation.browserSelection)
})
router.get('/page-count', async function (req, res) {
    let count = -1
    if (req.app.locals.puppeteerControl.page) {
        /**@type {Browser} */
        let browser = req.app.locals.puppeteerControl.browser
        count = (await browser.pages()).length
    }
    res.json({ value: count })
})
router.get('/html-queue', async function (req, res) {
    res.json(req.app.locals.workflow.htmlCaptureStatus.__queue)
})

module.exports = router;
