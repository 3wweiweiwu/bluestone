var express = require('express');
var router = express.Router();
const config = require('../config')
const path = require('path')
const fs = require('fs').promises
/* GET users listing. */
router.get('/js/:dependency', async function (req, res, next) {

    let fileDict = {
        'finder.js': path.join(__dirname, '../public/javascript/finder.js'),
        'customLocator.js': config.code.customLocatorEnginePath
    }
    let filePath = fileDict[req.params.dependency]
    if (filePath == null) {
        return res.json(400)
    }

    let fileContent = await fs.readFile(filePath)
    let fileStr = fileContent.toString()
    res.type('.js')
    res.send(fileStr);
});

module.exports = router;
