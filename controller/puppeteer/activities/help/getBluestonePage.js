const { Browser, Page } = require('puppeteer-core')
const config = require('../../../../config')
const path = require('path')
const fs = require('fs').promises
/**
 * Search through current browser and see if there is any existing rpa page
 * If there is any existing rpa page, activate it
 * Otherwise, create a new page and navigate it to the url
 * @param {Browser} browser 
 * @returns {Page}
 */
module.exports = async function (browser) {
    let currentPageList = await browser.pages()

    let targetPage = null
    let bluestonePageUrl = `http://localhost:${config.app.port}`
    //find bluestone website
    for (let i = 0; i < currentPageList.length; i++) {
        let page = currentPageList[i]
        let url = await page.url()
        if (url.toLowerCase().includes(bluestonePageUrl)) {
            targetPage = page
            break
        }
    }

    //bring up the page
    if (targetPage) {
        await targetPage.bringToFront()
    }
    else {
        targetPage = await browser.newPage()
        let locatorGenPath = path.join(__dirname, '../../../../public/javascript/robustLocatorGen.js')
        let locatorGen = await fs.readFile(locatorGenPath)
        await targetPage.evaluateOnNewDocument(locatorGen.toString())
        
    }

    return targetPage
}
