const puppeteer = require('puppeteer-core')
const config = require('../../config')
/**
 * Create a new puppeteer browser instance
 */
async function startRecording() {
    const browser = await puppeteer.launch(config.puppeteer)
    const page = await browser.newPage();
    return { browser, page }
}
/**
 * Close the puppeteer browser
 * @param {import('puppeteer').Browser} browser 
 */
async function endRecording(browser) {
    await browser.close()
}

module.exports = { startRecording, endRecording }