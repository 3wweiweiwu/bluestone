var express = require('express');
var router = express.Router();
const config = require('../config')
const funcGen = require('../controller/funcGen/index')

router.post('/compile', async function (req, res) {
    try {
        await req.app.locals.workflow.astManager.loadFunctions(config.code.funcPath)
        await req.app.locals.workflow.refreshActiveFunc()
        res.json()
    } catch (error) {
        res.status(400).json(error)
    }
});
router.post('/creation', async function (req, res) {
    try {
        let path = await funcGen(req.body.realtiveFolder, req.body.funcName)
        res.send(path)
    } catch (error) {
        res.status(400).json(error)
    }
});
module.exports = router;
