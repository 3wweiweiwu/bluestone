import { finder } from 'https://medv.io/finder/finder.js'

const EVENTCONST = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
}
const BLUESTONE = {
    previousbackground: 'bluestone-previous-background',
    dataSingleFileAttributePattern: 'data-single-file-',
    bluestoneLocator: 'bluestone-locator',
    bluestoneIframePath: 'bluestone-iframe-path'
}
/**
 * This function will add event listener for all dom element
 * 
 * implementation detail: 
 * This function relys on /exposure/logEvent function to communicate the event back to puppeteer
 * its class should be in sync with puppeteer/classes/uievent.js
*/

Object.keys(EVENTCONST).forEach(item => {
    document.addEventListener(item, event => {
        let selector = ''
        try {
            selector = finder(event.target)
        } catch (error) {
            console.log(error)
        }
        //retrieve iframe info for current frame
        let iframe = '[]'
        if (window.frameElement && window.frameElement.getAttribute(BLUESTONE.bluestoneIframePath)) {
            iframe = window.frameElement.getAttribute(BLUESTONE.bluestoneIframePath)
            console.log(iframe)
        }


        const position = event.target.getBoundingClientRect()
        const targetInnerText = event.target.innerText
        let parameter = null
        let command = item
        let targetPicPath = ''
        switch (item) {
            case EVENTCONST.change:
                parameter = event.target.value
                break;
            case EVENTCONST.keydown:
                //currently, we only support enter and esc key
                parameter = event.code
                switch (parameter) {
                    case 'Enter':
                        break;
                    case 'Escape':
                        break;
                    case 'Tab':
                        break;
                    default:
                        //if we see combo key ctrl-q, we will call in-browser plugin
                        if (event.ctrlKey && event.key === 'q') {
                            command = null
                            parameter = null
                            console.log('call in-browser spy')
                            break
                        }
                        //otherwise, we are not going to record any other operation
                        return
                }
                break;
            default:
                break;
        }
        const eventDetail = {
            command: command,
            iframe: iframe,
            target: selector,
            parameter: parameter,
            targetInnerText: targetInnerText,
            targetPicPath: targetPicPath,
            pos: {
                x: position.x,
                y: position.y,
                right: position.right,
                buttom: position.buttom,
                height: position.height,
                width: position.width
            }


        }
        // new CustomEvent('eventDetected', { detail: eventDetail });
        window.logEvent(eventDetail)

        // console.log(JSON.stringify(event))
    })
})

//XXX (RoadMap) Add a way to handle delete operation
//draw rectangle and return the selector and inner text of element mouse hover on
document.addEventListener('mouseover', async event => {
    if (window.isRecording()) {
        const selector = finder(event.target)
        const innerText = event.target.innerText
        let position = {}
        try {
            position = event.target.getBoundingClientRect()
        } catch (error) {
            console.log(error)
        }

        const previousStyle = event.target.style.backgroundColor
        event.target.setAttribute(BLUESTONE.previousbackground, previousStyle)

        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width)

        event.target.style.backgroundColor = 'rgba(140, 99, 255,0.7)'
    }



})

document.addEventListener("mouseout", event => {
    if (!window.isRecording()) return
    try {
        const previousStyle = event.target.getAttribute(BLUESTONE.previousbackground)
        if (previousStyle != null) {
            event.target.style.backgroundColor = previousStyle
            event.target.removeAttribute(BLUESTONE.previousbackground)
        }
    } catch (error) {

    }

})

//This function will find all element in the page and report them back to record manager

const Helper = {
    bsLocator: BLUESTONE.bluestoneLocator //this is attribute that is used to store locator mapping
}
async function LocatorScanner() {

    while (true) {
        /** @type {Array<import('../../locator/index').Locator>} */
        let currentLocatorList = await window.getLocator()
        let startTime = Date.now()

        for (let i = 0; i < currentLocatorList.length; i++) {
            currentLocatorList[i].selector = ''
            let locator = currentLocatorList[i]
            let currentLocatorOptions = locator.Locator
            let currentElement = null
            let currentLocator
            //search through avialble option to find if anhing match

            for (let locatorOptionIndex = 0; locatorOptionIndex < currentLocatorOptions.length; locatorOptionIndex++) {

                currentLocator = currentLocatorOptions[locatorOptionIndex]
                if (currentLocator.startsWith('/')) {
                    //current locator is xpath

                    currentElement = document.evaluate(currentLocator, document).iterateNext()
                }
                else {
                    //current selector is css selector
                    currentElement = document.querySelector(currentLocator)
                }
                //if current locator find element, break current loop to save time
                if (currentElement != null) {
                    break
                }
            }

            if (currentElement != null) {
                //UI elemnet found, update its attribute
                let currentBluestoneSelector = currentElement.getAttribute(Helper.bsLocator)

                if (currentBluestoneSelector == null) {
                    currentBluestoneSelector = finder(currentElement)
                    currentElement.setAttribute(Helper.bsLocator, currentBluestoneSelector)
                }
                currentLocatorList[i].selector = currentBluestoneSelector
            }

        }

        let endTime = Date.now()
        let timeSpan = endTime - startTime
        await window.setLocatorStatus(currentLocatorList, timeSpan)
        // await new Promise(resolve => { setTimeout(resolve, 500) })
    }



}
LocatorScanner()


async function captureHtml() {
    try {
        await window.captureHtml()
    } catch (error) {

    }


}


async function captureScreenshot() {
    try {
        await window.captureScreenshot()
    } catch (error) {

    }


}
/**
 * This function will automatically assign locator to iframe element. 
 */
const getFrameLocator = function () {
    let iframeLocatorJson = '[]'
    //get parent locator id
    if (window.frameElement != null && window.frameElement.getAttribute(BLUESTONE.bluestoneIframePath) != null) {
        iframeLocatorJson = window.frameElement.getAttribute(BLUESTONE.bluestoneIframePath)
    }
    let iframeElements = document.getElementsByTagName('iframe')
    for (const element of iframeElements) {
        //get selector for current iframe
        let selector = finder(element)
        //parse original locator
        let iframeLocator = JSON.parse(iframeLocatorJson)
        //add current selector to the list
        iframeLocator.push(selector)
        //set attribute and convert that back to json
        let strLocator = JSON.stringify(iframeLocator)

        element.setAttribute(BLUESTONE.bluestoneIframePath, strLocator)
    }

}
// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

// Create an observer instance linked to the callback function
const mutationObserverCallback = function (mutationsList, observer) {
    function checkAttributeNameExists(targetAttribute) {
        let isAttributeNameExists = false
        for (const mutation of mutationsList) {
            let attributeName = mutation.attributeName
            try {
                isAttributeNameExists = attributeName.includes(targetAttribute)
            } catch (error) { }
            if (isAttributeNameExists) {
                return isAttributeNameExists
            }
        }
        return isAttributeNameExists

    }
    //will not proceed the change that is introduced by single file downloader
    if (checkAttributeNameExists(BLUESTONE.dataSingleFileAttributePattern)) {
        return
    }
    if (checkAttributeNameExists(BLUESTONE.bluestoneLocator)
        || checkAttributeNameExists(BLUESTONE.previousbackground)
        || checkAttributeNameExists(BLUESTONE.bluestoneIframePath)) {
        return
    }
    captureScreenshot()
    //only proceed change that is introduced by RPA engine or code change
    captureHtml()
    getFrameLocator()
    // console.log(mutationsList)
}

const observer = new MutationObserver(mutationObserverCallback);



// Start observing the target node for configured mutations
observer.observe(document, config);

//when scroll up and down, take screenshot
document.addEventListener('scroll', captureScreenshot)

captureHtml()
captureScreenshot()
getFrameLocator()