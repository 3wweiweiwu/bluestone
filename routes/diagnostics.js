var express = require('express');
const { Browser } = require('puppeteer-core');
var router = express.Router();
router.get('/steps', async function (req, res) {

    res.json(JSON.stringify(req.app.locals.ui.backend.steps))
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

module.exports = router;
