const { Page, Frame, ElementHandle, Browser } = require('puppeteer-core')
const ElementSelector = require('../../class/ElementSelector')
const VarSaver = require('../../class/VarSaver')
const findElement = require('../findElement')
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const initializeFolder = require('./initializeFolder')
/**
 * Initialize Download Feature
 * It will clean up the browser and start to watch the folder
*  @param {VarSaver} vars 
 * @param {Page} page
 */
module.exports = async function initializeDownload(vars, page) {
    //create download folder
    initializeFolder(vars.downloadManager.downloadFolder)
    //set download path
    let client = await page.target().createCDPSession()
    await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: vars.downloadManager.downloadFolder });

    //populate download task queue
    var watcher = chokidar.watch(vars.downloadManager.downloadFolder, { ignored: /\.crdownload$/, persistent: true });
    watcher
        .on('add', function (path) {
            vars.downloadManager.completeDownload(path)
            console.log('File', path, 'has been added');
        })
        .on('change', function (path) {
            vars.downloadManager.completeDownload(path)
            console.log('File', path, 'has been changed');
        })
}