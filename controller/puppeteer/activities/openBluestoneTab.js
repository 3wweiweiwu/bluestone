const { Browser } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
const config = require('../../../config')
/**
 * launch bluestone page and go to specified bluestone path
 * @param {Browser} browser 
 * @param {'spy'|'workflow'} bluestonePath 
 */
module.exports = async function (browser, bluestonePath) {
    let targetPage = await getBluestonePage(browser)
    let bluestonePageUrl = `http://localhost:${config.app.port}`


    //navigate to bluestone url
    await targetPage.goto(`${bluestonePageUrl}/${bluestonePath}`)
    await targetPage.bringToFront()
}