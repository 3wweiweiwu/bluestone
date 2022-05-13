const { ElementHandle, Frame } = require('puppeteer-core')
/**
 * 
 * @param {Frame} frame 
 * @param {string} currentLocator 
 * @param {number} timeout timeout in ms
 * @returns {Array<ElementHandle>}
 */
module.exports = async function getLocator(frame, currentLocator, timeout = 1) {

    /** @type {Array<ElementHandle>} */
    let elements
    let startTime = Date.now()
    while (true) {
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
        //break the loop if elemnet is found
        if (elements.length > 0) {
            break
        }
        //break the loop if timeout has been reached
        let currentTime = Date.now()
        let timeSpan = currentTime - startTime
        if (timeSpan > timeout) {
            break
        }
    }


    return elements
}