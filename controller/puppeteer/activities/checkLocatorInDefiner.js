const { Browser, ElementHandle } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
/**
 * @param {Browser} browser
 * @param {string} locator
 */
module.exports = async function (browser, locator) {
    //sidebar is the id for the locatorDefinerpug
    let page = await getBluestonePage(browser)
    let viewerSelector = '#viewer'
    let frame = page.frames().find(item => {
        return item._id == viewerSelector
    })
    let errorText = ''
    /** @type {Array<ElementHandle>} */
    let elements
    if (locator.startsWith('/')) {
        elements = await frame.$x(locator)

    }
    else {
        elements = await frame.$$(locator)
    }
    if (elements.length == 0) {
        errorText = 'Cannot find locator specified. Please try something else'
    }
    if (elements.length > 1) {
        errorText = 'More than 1 locator is found. Please try something else'
    }

    return errorText



}