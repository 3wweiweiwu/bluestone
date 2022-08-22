const { Browser } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
const config = require('../../../config')
/**
 * launch bluestone page and go to specified bluestone path
 * @param {Browser} browser 
 * @param {'spy'|'workflow'|'refresh'} bluestonePath refresh means refresh current page
 */
module.exports = async function (browser, bluestonePath) {
    let targetPage = await getBluestonePage(browser)



    //navigate to bluestone url if we are not in the refresh mode
    if (bluestonePath != 'refresh') {
        let bluestonePageUrl = `http://localhost:${config.app.port}`
        await targetPage.goto(`${bluestonePageUrl}/${bluestonePath}`)
    }
    await targetPage.bringToFront()
    await targetPage.evaluate(() => {
        location.reload(true)
    })
}