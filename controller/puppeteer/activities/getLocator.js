const { ElementHandle, Frame } = require('puppeteer-core')
/**
 * 
 * @param {Frame} frame 
 * @param {string} currentLocator 
 * @returns {Array<ElementHandle>}
 */
module.exports = async function getLocator(frame, currentLocator) {

    /** @type {Array<ElementHandle>} */
    let elements

    if (currentLocator.startsWith('/') || currentLocator.startsWith('(')) {
        try {
            elements = await frame.$x(currentLocator)
        } catch (error) {
            elements = []
        }


    }
    else {
        try {
            elements = await frame.$$(currentLocator)
        } catch (error) {
            elements = []
        }

    }

    return elements
}