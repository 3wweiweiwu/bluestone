const { Frame, Page } = require('puppeteer-core')
const getLocator = require('../activities/getLocator')
/**
 * 
 * @param {Page|Frame} page 
 * @param {Array<string>} parentIframes 
 * @returns {Frame}
 */
async function getFrame(page, parentIframes) {
    let frame = page
    //navigate through frames and get to current elements
    for (const frameLocator of parentIframes) {
        let frameElements = await getLocator(frame, frameLocator)
        if (frameElements.length != 1) {
            return null
        }
        try {
            frame = await frameElements[0].contentFrame()
        } catch (error) {
            return null
        }
    }
    return frame
}

module.exports = getFrame