const path = require('path')
const fs = require('fs')
const { Page } = require('puppeteer')
/**
 * Take screenshot and save it in the public/temp/componentPic/LocatorDefiner.png
 * @param {Page} page 
 */
module.exports = async function (page) {
    let picPath = path.join(__dirname, '../../../public/temp/componentPic/', 'locatorDefiner.png')

    try {
        await fs.promises.unlink(picPath)
    } catch (error) {

    }
    await page.screenshot({ path: picPath })
}