const { Page, Frame, ElementHandle, Browser } = require('puppeteer')
const ElementSelector = require('../../class/ElementSelector')
const VarSaver = require('../../class/VarSaver')
const findElement = require('../findElement')
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const chokidar = require('chokidar')
const initializeFolder = require('./initializeFolder')
/**
 * Initialize Alert Watcher
 * It will supress dialog box whenever it appear and register its information into varSaver
*  @param {VarSaver} vars 
 * @param {Page} page
 */
module.exports = async function initializeAlertHandle(vars, page) {

    page.on('dialog', async dialog => {
        let dialogMessage = dialog.message()
        vars.alertManager.addAlert(dialogMessage)
        await dialog.accept()
    })
}