const { Browser, ElementHandle, Frame } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
const getLocator = require('./getLocator')
const getFrame = require('./getFrame')
const ptInbuiltFunc = require('../../../ptLibrary/functions/inbuiltFunc')
const config = require('../../../config')
/**
 * @param {Browser} browser
 * @param {string} targetLocator
 * @param {Array<string>} parentIframes
 */
module.exports = async function getRecommendedLocator(browser, targetLocator, parentIframes) {
    //sidebar is the id for the locatorDefinerpug
    let page = await getBluestonePage(browser)
    //find frame that pointes to temp folder. This is the place where we store html page
    let frame = null
    let iTimeout = 0
    do {

        await page.waitForTimeout(500)
        frame = page.frames().find(item => {
            return item.url().includes('/temp/')
        })


    } while (frame == null)


    /** @type {Array<ElementHandle>} */
    let elements = []
    let errorText = ''

    //if target locator is equal to current locator and equals to null, it means we are dealing with parent locator, just return as it is

    //wait until we find current iframe
    frame = await getFrame(frame, parentIframes)
    if (frame == null) {
        return `Unable to navigate to iframe ${JSON.stringify(parentIframes)}`
    }

    /** @type {Array<ElementHandle>} */
    let targetElementList = await getLocator(frame, targetLocator)

    //if there are more than 1 lcoator, we cannot proceed
    if (targetElementList.length != 1) {
        console.warn('More than 1 target locator found!')
        return []
    }

    let target = targetElementList[0]
    //get rid of bluestone property within the element
    let locatorList = await target.evaluate((element, locatorAttributePreference) => {
        let bluestoneAttributes = []
        for (let i = 0; i < element.attributes.length; i++) {
            let attr = element.attributes[i].name
            if (attr.toLowerCase().includes('bluestone')) {
                bluestoneAttributes.push(attr)
            }
            //correct background color
            if (attr == 'bluestone-previous-background') {
                let backgroundColor = element.attributes[i].value
                element.style.backgroundColor = backgroundColor
            }
            //correct border line
            if (attr == 'bluestone-previous-border') {
                let border = element.attributes[i].value
                element.style.border = border
            }

        }

        bluestoneAttributes.forEach(att => {
            element.removeAttribute(att)
        })
        if (element.getAttribute('style') == '') {
            element.removeAttribute('style')
        }

        let locatorProposal = findRobustLocatorForSelector(element, locatorAttributePreference)
        let locators = locatorProposal.map(item => item.locator)
        return locators
    }, config.code.locatorAttributePreference)

    frame = page.frames().find(item => {
        return item.url().includes('locator-definer-sidebar')
    })
    await frame.evaluate(() => {
        location.reload()
    })


    return locatorList
}

