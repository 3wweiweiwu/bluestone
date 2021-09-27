const { Browser } = require('puppeteer-core')
const config = require('../../../config')
/**
 * Search through current browser and see if there is any existing rpa page
 * If there is any existing rpa page, activate it
 * Otherwise, create a new page and navigate it to the url
 * @param {Browser} browser 
 * @param {'spy'|'workflow'} bluestonePath 
 */
module.exports = async function (browser, bluestonePath) {
    let currentPageList = await browser.pages()
    let bluestonePageUrl = `http://localhost:${config.app.port}`
    let targetPage = null

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
    }

    //navigate to bluestone url
    await targetPage.goto(`${bluestonePageUrl}/${bluestonePath}`)
    await targetPage.bringToFront()
}