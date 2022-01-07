const { Browser, ElementHandle, Frame } = require('puppeteer-core')
const getBluestonePage = require('./help/getBluestonePage')
const getLocator = require('./getLocator')
const getFrame = require('./getFrame')
const ptInbuiltFunc = require('../../../ptLibrary/functions/inbuiltFunc')
/**
 * @param {Browser} browser
 * @param {string} currentLocator
 * @param {string} targetLocator
 * @param {Array<string>} parentIframes
 */
module.exports = async function (browser, targetLocator, currentLocator, parentIframes) {
    //sidebar is the id for the locatorDefinerpug
    let page = await getBluestonePage(browser)
    //find frame that pointes to temp folder. This is the place where we store html page
    let frame = page.frames().find(item => {
        return item.url().includes('/temp/')
    })

    /** @type {Array<ElementHandle>} */
    let elements = []
    let errorText = ''

    //if target locator is equal to current locator and equals to null, it means we are dealing with parent locator, just return as it is

    //navigate through frames and get to current elements
    frame = await getFrame(frame, parentIframes)
    if (frame == null) {
        return `Unable to navigate to iframe ${JSON.stringify(parentIframes)}`
    }

    if (parentIframes.length == 0 && targetLocator == ptInbuiltFunc.VAR.parentIFrameLocator) {
        //we are swithcing back to the top frame
        if (currentLocator == ptInbuiltFunc.VAR.parentIFrameLocator) {
            return errorText
        }
        else {
            return 'Please use default value as we are switching back to parent frame'
        }
    }

    /** @type {Array<ElementHandle>} */
    elements = await getLocator(frame, currentLocator)

    if (elements.length == 0) {
        errorText = 'Cannot find locator specified. Please try something else'
    }
    else if (elements.length > 1) {
        errorText = 'More than 1 locator is found. Please try something else'
    }
    else {
        //check if two elements are of the same coordination
        //check if there is error in original locator
        let targetElementList = await getLocator(frame, targetLocator)
        if (targetElementList.length == 0) {
            errorText = 'Original Selector cannot be found. Please contact bluestone team or check your selector generator'
            return errorText
        }
        else if (targetElementList.length > 1) {
            errorText = 'More than 1 selector being found. Please contact bluestone team or check your selector generator'
            return errorText
        }
        //get target element
        let targetElement = targetElementList[0]
        let targettBox = await targetElement.boundingBox()
        let currentBox = await elements[0].boundingBox()
        if (currentBox == null) {
            //when targebox and current box is invisible, conduct blind check
            if (targettBox != currentBox) {
                errorText = 'The current element is not found'
            }
        }
        else if (targettBox == null) {
            //target element cannot be found. Conduct blind check
            return errorText
        }
        else if (targettBox.height + targettBox.y < currentBox.height + currentBox.y ||
            //check if current element is within the target element.
            targettBox.width + targettBox.x < currentBox.width + currentBox.x ||
            targettBox.x > currentBox.x ||
            targettBox.y > currentBox.y
        ) {
            errorText = 'The current element is not contained within target element'
        }

        //check if current element and target element has same inner text. This is important becasue we might use current value for text validation
        let targetText = await targetElement.evaluate(el => el.textContent);
        let currentText = await elements[0].evaluate(el => el.textContent);
        if (errorText == '' && targetText != currentText) {
            errorText = `Inner Text is different. The target locator has inner text "${targetText}" while the current locator has inner text "${currentText}"`
        }
    }
    return errorText



}
