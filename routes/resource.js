var express = require('express');
var router = express.Router();
const config = require('../config')
const path = require('path')
const fs = require('fs').promises
/* GET users listing. */
router.get('/js/:dependency', async function (req, res, next) {

    let fileDict = {
        'finder.js': path.join(__dirname, '../public/javascript/finder.js'),
        'fileUpload.js': path.join(__dirname, '../public/javascript/fileUpload.js'),
        'customLocator.js': config.code.customLocatorEnginePath,
        'socket.io.esm.min.js': path.join(__dirname, '../public/javascript/socket.io.esm.min.js'),

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
