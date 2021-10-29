const { Page } = require("puppeteer")
const config = require('../../../config')
const HtmlCaptureStatus = require('../../record/class/HtmlCaptureStatus')
const PicCaptureStatus = require('../../record/class/PicCapture')

const ProgressBarConst = {
    id: 'bluestone-pending-progress'
}
/**
 * Draw Progress bar iframe in the middle of the page
 * @param {Page} page 
 */
async function drawProgressBar(page, pendingPicCapture, pendingHtmlCapture) {
    let url = `http://localhost:${config.app.port}/pending-capture`
    await page.evaluate((progressBarId, pendingPicCapture, pendingHtmlCapture) => {
        let progress = document.getElementById(progressBarId)
        if (progress == null) {
            progress = document.createElement('div')
            progress.id = progressBarId
            // progress.src = url
            progress.style.position = 'fixed'
            progress.style.top = '30%'
            progress.style.left = '30%'
            progress.style.width = '40%'
            progress.style.height = '40%'
            progress.style.fontSize = '30px'
            progress.style.background = 'white'
        }
        progress.innerText = `Please wait while we are completing some background work. Pending Html Capture:${pendingHtmlCapture}; Pending Pic Capture ${pendingPicCapture}} !`
        document.body.appendChild(progress)
    }, ProgressBarConst.id, pendingPicCapture, pendingHtmlCapture)

}
/**
 * Remove progress bar from the middle of the page
 * @param {Page} page 
 */
async function deleteProgressBar(page) {
    await page.evaluate((progressBarId) => {
        let progress = document.getElementById(progressBarId)
        progress.parentElement.removeChild(progress)
    }, ProgressBarConst.id)

}
/**
 * Draw progress bar based on pending work, progress bar will be diappeared once it finish its work
 * @param {Page} page 
 * @param {PicCaptureStatus} PicCaptureStatus 
 * @param {HtmlCaptureStatus} htmlCaptureStatus
 */
async function drawPendingWorkProgress(page, PicCaptureStatus, htmlCaptureStatus) {


    //keep waiting until capture is all completed
    while (PicCaptureStatus.isCaptureOngoing || htmlCaptureStatus.isHtmlCaptureOngoing) {
        try {
            await drawProgressBar(page, (PicCaptureStatus.__queue.length - PicCaptureStatus.__popIndex - 1), (htmlCaptureStatus.__queue.length - htmlCaptureStatus.__popIndex - 1))
        } catch (error) {
            console.log()
        }

        await new Promise(resolve => { setTimeout(resolve, 500) })
    }
    await deleteProgressBar(page)
}

module.exports = { drawPendingWorkProgress }