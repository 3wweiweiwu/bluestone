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
module.exports = async function getRecommendedLocator(browser, page, targetLocator, parentIframes) {
    // //find bluestone website
    // let currentPageList = null

    // let targetPage = null
    // let bluestonePageUrl = `http://localhost:${config.app.port}`
    // //waiting for bluestone page to be ready
    // while (true) {
    //     currentPageList = await browser.pages()
    //     for (let i = 0; i < currentPageList.length; i++) {
    //         let page = currentPageList[i]
    //         let url = await page.url()
    //         if (url.toLowerCase().includes(bluestonePageUrl)) {
    //             targetPage = page
    //             break
    //         }
    //     }
    //     await new Promise(resolve => setTimeout(resolve, 500))
    //     if (targetPage == null) continue

    //     break
    // }


    // //sidebar is the id for the locatorDefinerpug

    // let page = targetPage
    //find frame that pointes to temp folder. This is the place where we store html page
    /**@type {Frame} */
    let frame = page

    // do {

    //     await page.waitForTimeout(500)
    //     frame = page.frames().find(item => {
    //         return item.url().includes('/temp/')
    //     })


    // } while (frame == null)


    //if target locator is equal to current locator and equals to null, it means we are dealing with parent locator, just return as it is

    //wait until we find current iframe
    try {
        parentIframes = JSON.parse(parentIframes)
    } catch (error) {

    }
    frame = await getFrame(frame, parentIframes)
    if (frame == null) {
        return `Unable to navigate to iframe ${JSON.stringify(parentIframes)}`
    }
    /** @type {Array<ElementHandle>} */
    let targetElementList = await getLocator(frame, targetLocator)

    //Due to html snapshot issue, we are unable to find locator correctly
    if (targetElementList.length != 1) {
        console.warn(`Error: ${targetElementList.length} locators found!`)
        return []
    }

    let target = targetElementList[0]
    //get rid of bluestone property within the element
    let locatorList = await target.evaluate((element, locatorAttributePreference) => {
        let bluestoneAttributes = []
        for (let i = 0; i < element.attributes.length; i++) {
            let attr = element.attributes[i].name
            if (attr.toLowerCase().includes('bluestone') && !attr.toLowerCase().includes('bluestone-potential-match-indexes')) {
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




    return locatorList
}

