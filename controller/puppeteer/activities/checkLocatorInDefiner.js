const { Browser, ElementHandle } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
/**
 * @param {Browser} browser
 * @param {string} locator
 */
module.exports = async function (browser, locator) {
    //sidebar is the id for the locatorDefinerpug
    let page = await getBluestonePage(browser)
    //find frame that pointes to temp folder. This is the place where we store html page
    let frame = page.frames().find(item => {
        return item.url().includes('/temp/')
    })
    let errorText = ''
    /** @type {Array<ElementHandle>} */
    let elements
    if (locator.startsWith('/')) {
        try {
            elements = await frame.$x(locator)
        } catch (error) {
            elements = []
        }


    }
    else {
        try {
            elements = await frame.$$(locator)
        } catch (error) {
            elements = []
        }

    }
    if (elements.length == 0) {
        errorText = 'Cannot find locator specified. Please try something else'
    }
    if (elements.length > 1) {
        errorText = 'More than 1 locator is found. Please try something else'
    }

    return errorText



}