const mhtml2html = require('mhtml2html/dist/mhtml2html')
const fs = require('fs').promises
const path = require('path')
const { expose } = require("threads/worker")
const { JSDOM } = require('jsdom');




async function convertMHtml(screenshotRecord, newHtmlPath, newPicPath, testResultFolder) {
    try {
        let mhtmlData = null
        try {
            mhtmlData = await fs.readFile(screenshotRecord.mhtmlPath)
        } catch (error) {
            //in case we cannot find the file in the same folder, try to load it from same folder
            let mhtmlFileName = path.basename(screenshotRecord.mhtmlPath)
            screenshotRecord.mhtmlPath = path.join(testResultFolder, mhtmlFileName)
            mhtmlData = await fs.readFile(screenshotRecord.mhtmlPath)

        }

        let doc = mhtml2html.convert(mhtmlData.toString(), { convertIframes: true, parseDOM: (html) => new JSDOM(html) });
        await fs.writeFile(newHtmlPath, doc.serialize())
    } catch (error) {
        //copy file to bluestone folder and make it ready for display
        try {
            await fs.copyFile(screenshotRecord.picPath, newPicPath)
        } catch (error) {
            console.log(error)
        }
    }
}

expose({
    convertMHtml
})

