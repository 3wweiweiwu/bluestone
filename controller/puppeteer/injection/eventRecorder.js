// import { finder } from 'https://medv.io/finder/finder.js'

import { finder } from 'http://localhost:3600/javascript/finder.js'
import { getLocator } from 'http://localhost:3600/resource/js/customLocator.js'
import { fileUpload } from 'http://localhost:3600/resource/js/fileUpload.js'
import { io } from "http://localhost:3600/javascript/socket.io.esm.js";
import { getElementPos } from "http://localhost:3600/javascript/getElementPosition.js";
import { PotentialMatchManager } from "http://localhost:3600/javascript/LocatorScanner.js";
import { setStateToAllEvents } from "http://localhost:3600/javascript/blockElementInteraction.js";
import { getXPath } from 'http://localhost:3600/javascript/getXPath.js';
window.getXPath = getXPath
import AtomicElementTree from "http://localhost:3600/javascript/AtomicElementTree.js"
try {

} catch (error) {

}

let globalVar = {
    isFreezeMode: false,
    isRecordScroll: true,
    scanLocatorQueue: [],
    capturePicQueue: [],
    tabIndex: 1,
    potentialMatchManager: null

}
const EVENTCONST = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
    dragstart: 'dragstart',
    drop: 'drop',
    scroll: 'scroll',
    mousedown: 'mousedown',
    mouseup: 'mouseup',
    visibilitychange: 'visibilitychange'

}
const BLUESTONE = {
    previousbackground: 'bluestone-previous-background',
    dataSingleFileAttributePattern: 'data-single-file-',
    bluestonePotentialMatchIndexes: 'bluestone-potential-match-indexes',
    bluestoneIframePath: 'bluestone-iframe-path',
    bluestoneSelectedLocatorIndex: 'bluestone-selected-locator',
    scanLocator: 'scan-locator',
    markSelectorIndex: 'mark-selector-index',
    prevDisableStatus: 'bluestone-prev-disabled-status',
    prevFunctionStatus: 'bluestone-prev-func-',
    bluestoneIgnoreElement: 'bluestone-ignore-element',
    bluestonePrevPointerEvent: 'bluestone-prev-pointer-event'
}

/**
 * get attribute value based on attribute name
 * @param {string} attributeName
 * @returns {string}
 */
function getElementAttribute(element, attributeName) {
    //retrieve iframe info for current frame
    let iframe = '[]'
    if (element && element.getAttribute(attributeName)) {
        iframe = element.getAttribute(attributeName)
    }
    return iframe
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
        function getRelativeXYCoordination(event) {
            let target = event.target
            let framePosition = target.getBoundingClientRect() //this is position in regards to curent frame
            let relativeMouseX = Math.round(((event.clientX - framePosition.x) / framePosition.width) * 100) / 100
            let relativeMouseY = Math.round((event.clientY - framePosition.y) / framePosition.height * 100) / 100

            //1st realtive x cannot be less than 0
            //2nd somehow, escodegen does not support negative number output
            if (relativeMouseX < 0 || relativeMouseX > 1) {
                relativeMouseX = 0.5
            }
            if (relativeMouseY < 0 || relativeMouseY > 1) {
                relativeMouseY = 0.5
            }
            let jsonStr = JSON.stringify({
                x: relativeMouseX,
                y: relativeMouseY
            })
            return jsonStr

        }
        //if the target is whole document, we will redirect it to body because document does not have
        //.getAttribute function. It will cause problem
        let targetElement = event.target
        if (event.target == document) {
            targetElement = document.body
        }
        let timeStamp = Date.now()
        let selector = ''
        try {
            selector = getXPath(targetElement)
        } catch (error) {
            selector = finder(targetElement)
        }

        let customLocator = {
            target: targetElement
        }
        try {
            customLocator = getLocator(targetElement, selector)
        } catch (error) {

        }

        //if there is selector from locator function, we will prioritize that one
        //if there is no selector from locator function yet the target has been changed, 
        //use new target to generate selector
        if (customLocator.selector)
            selector = customLocator.selector
        else if (customLocator.target != targetElement)
            selector = finder(customLocator.target)
        let target = customLocator.target
        if (selector == null) return
        let iframe = getElementAttribute(window.frameElement, BLUESTONE.bluestoneIframePath)
        let framePotentialMatch = getElementAttribute(window.frameElement, BLUESTONE.bluestonePotentialMatchIndexes)
        let potentialMatch = getElementAttribute(target, BLUESTONE.bluestonePotentialMatchIndexes)
        let currentSelectedIndex = target.getAttribute(BLUESTONE.bluestoneSelectedLocatorIndex)


        let position = getElementPos(target) // this is position in regards to the screen
        let targetInnerText = target.innerText
        let parameter = null
        let command = item
        let targetPicPath = ''
        let fileNames = []
        let isCallBluestoneConsole = false
        switch (item) {
            case EVENTCONST.visibilitychange:
                if (document.visibilityState == 'hidden') return
                //in edit mode, we saw an situation where a swap tab operation is added at the end
                // we will normally land in about:blank page when we are coming from edit mode
                //As we switch to page, it will triger an go to tab action
                //in this case, we will not record any switch page action from about:blank
                //to avoid adding unnecessary steps toward the end of the script
                if (window.location.href == 'about:blank') return
                parameter = JSON.stringify({
                    tabIndex: globalVar.tabIndex
                })
                command = 'switchTab'
                break
            case EVENTCONST.click:
                // console.log(`frame Position: ${JSON.stringify(framePosition)} absolute position: ${JSON.stringify(position)}, clientX,y: ${event.clientX},${event.clientY}`)
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.mousedown:
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.mouseup:
                parameter = getRelativeXYCoordination(event)
                break
            case EVENTCONST.change:
                //still use original target because the new target may not have value
                parameter = targetElement.value
                //handle file upload through input
                fileNames = fileUpload(event)
                if (fileNames.length != 0) {
                    command = 'upload'
                    parameter = fileNames
                }
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
                        if ((event.ctrlKey || event.altKey) && event.key === 'q') {
                            // captureHtml('alt+q')
                            command = null
                            parameter = null
                            // window.stopRecording()
                            getActiveLocator()
                            captureScreenshot('alt+q')
                            isCallBluestoneConsole = true
                            console.log('call in-browser spy' + JSON.stringify(position))
                            break
                        }
                        if ((event.altKey) && event.key === 's') {
                            globalVar.isFreezeMode = !globalVar.isFreezeMode
                            console.log('Current Freeze State is :' + globalVar.isFreezeMode)
                            // setStateToAllEvents(globalVar.isFreezeMode, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus, BLUESTONE.bluestonePrevPointerEvent)
                        }
                        if ((event.altKey) && event.key === 'r') {
                            globalVar.isRecordScroll = !globalVar.isRecordScroll
                            console.log('Current Scroll Capture State is :' + globalVar.isRecordScroll)
                            // setStateToAllEvents(globalVar.isFreezeMode, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus, BLUESTONE.bluestonePrevPointerEvent)
                        }
                        if ((event.altKey) && event.key === 'a') {
                            captureScreenshot('alt+a')
                            // captureHtml()
                        }
                        //otherwise, we are not going to record any other operation
                        return
                }
                break;
            case EVENTCONST.scroll:
                parameter = JSON.stringify({
                    y: targetElement.scrollTop,
                    x: targetElement.scrollLeft
                })
                break;
            default:
                break;
        }

        // if (isParentDefinedAndIdentical(event.target, position, potentialMatch)) {
        //     console.log()
        //     let parent = event.target.parentElement

        //     potentialMatch = parent.getAttribute(BLUESTONE.bluestonePotentialMatchIndexes)

        //     selector = finder(parent)
        // }

        let atomicTree = ""
        let atomicTreeStr = ""//atomicTree.stringify()
        if (command != EVENTCONST.scroll && !isCallBluestoneConsole) {
            //will not capture auto-healing information during scroll
            //it will significantly slow down the user experience
            // will collect auto-healing when call bluestone console
            // this will create noticible user experience slow down
            // atomicTree = new AtomicElementTree(target)
            // atomicTreeStr = atomicTree.stringify(atomicTree)
        }
        const eventDetail = {
            command: command,
            iframe: iframe,
            target: selector,
            parameter: parameter,
            targetInnerText: targetInnerText,
            framePotentialMatch: framePotentialMatch,
            targetPicPath: targetPicPath,
            potentialMatch: potentialMatch,
            currentSelectedIndex: currentSelectedIndex,
            pos: {
                x: position.x,
                y: position.y,
                right: position.right,
                buttom: position.buttom,
                height: position.height,
                width: position.width
            },
            timestamp: timeStamp,
            healingTree: atomicTreeStr
        }
        //will not record any event that is marked as ignore.
        //we will not block event to call bluestone agent
        if (target.getAttribute(BLUESTONE.bluestoneIgnoreElement && command != null)) return

        // new CustomEvent('eventDetected', { detail: eventDetail });
        //will only log event from visible behavior except for file upload
        //file upload could trigger another element
        if ((position.height > 0 && position.width > 0) || command == 'upload' || command == null) {
            window.logEvent(eventDetail)
        }

        // console.log(JSON.stringify(event))
    }, { capture: true })
})

//XXX (RoadMap) Add a way to handle delete operation
//draw rectangle and return the selector and inner text of element mouse hover on
document.addEventListener('mouseover', async event => {
    let selector = null
    try {
        selector = getXPath(event.target)
    } catch (error) {
        selector = finder(event.target)

    }


    let customLocator = {
        target: event.target
    }
    try {
        customLocator = getLocator(event.target, selector)
    } catch (error) {
        console.log(error)
    }
    //if there is selector from locator function, we will prioritize that one
    //if there is no selector from locator function yet the target has been changed, 
    //use new target to generate selector
    if (customLocator.selector)
        selector = customLocator.selector
    else if (customLocator.target != event.target)
        selector = finder(customLocator.target)
    let target = customLocator.target
    if (selector == null) return
    const innerText = target.innerText
    let position = {}
    try {
        position = getElementPos(target)
    } catch (error) {
        console.log(error)
    }

    // let atomicTree = new AtomicElementTree(target)
    // let atomicTreeStr = atomicTree.stringify()
    let atomicTree = {}
    let atomicTreeStr = '{}'
    //style change will only be applied to source element
    const previousStyle = event.target.style.backgroundColor
    event.target.setAttribute(BLUESTONE.previousbackground, previousStyle)
    let iFrame = getElementAttribute(window.frameElement, BLUESTONE.bluestoneIframePath)
    let framePotentialMatch = getElementAttribute(window.frameElement, BLUESTONE.bluestonePotentialMatchIndexes)
    let potentialMatch = getElementAttribute(target, BLUESTONE.bluestonePotentialMatchIndexes)

    let noLocatorFound = 'rgba(255, 0, 145, 0.45)'
    let locatorFound = 'rgba(0, 223, 145, 0.45)'
    //depends on the color schema, display different color to give user a hint for next step

    //if we have set the final locator, mark it as green
    let currentSelectedIndex = target.getAttribute(BLUESTONE.bluestoneSelectedLocatorIndex)
    if (currentSelectedIndex) {
        event.target.style.backgroundColor = locatorFound
        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, currentSelectedIndex, atomicTreeStr)
        // setStateToAllEvents(false, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)
        // console.log('current selected index found')
        return
    }


    //no match mark as no locator found
    if (potentialMatch == '[]') {
        event.target.style.backgroundColor = noLocatorFound
        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, null, atomicTreeStr)
        // setStateToAllEvents(true, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)
        // console.log('no potential match index')
        return
    }

    let potentialMatchArray = JSON.parse(potentialMatch)
    // console.log(potentialMatch)
    // console.log(potentialMatchArray)
    if (potentialMatchArray.length == 1) {
        //exact one match, we are good
        event.target.style.backgroundColor = locatorFound
        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, 0, atomicTreeStr)
        // setStateToAllEvents(false, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)
        // console.log('only 1 potential match index')
        return
    }

    //if toehrwise, 
    // console.log('more than 1 potential matches')
    event.target.style.backgroundColor = noLocatorFound
    window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width, iFrame, potentialMatch, framePotentialMatch, null, atomicTreeStr)
    // setStateToAllEvents(true, BLUESTONE.bluestoneIgnoreElement, BLUESTONE.prevDisableStatus)




}, { capture: true })

document.addEventListener("mouseout", event => {
    try {
        const previousStyle = event.target.getAttribute(BLUESTONE.previousbackground)
        if (previousStyle != null) {
            event.target.style.backgroundColor = previousStyle
            event.target.removeAttribute(BLUESTONE.previousbackground)
        }
    } catch (error) {

    }

})
/**
 * Check parent element as we might defined things at parent level rather than atomic level
 * @param {*} element  //the element you want to check against
 * @param {*} position //the bounding rectangle of current parent
 * @param {*} potentialMatch 
 */
function isParentDefinedAndIdentical(element, position, potentialMatch) {
    let parent = element.parentElement

    if (potentialMatch == '[]' && parent != null && parent.getAttribute(BLUESTONE.bluestonePotentialMatchIndexes) != null) {
        let parentPos = parent.getBoundingClientRect()
        if (position.x == parentPos.x && position.y == parentPos.y && parentPos.height == position.height && parentPos.width == position.width) {
            return true
        }
    }
    return false
}
//This function will find all element in the page and report them back to record manager

const Helper = {
    potentialLocatorMatchIndexes: BLUESTONE.bluestonePotentialMatchIndexes //this is attribute that is used to store locator mapping
}
function getActiveLocator() {
    let activeLocatorIndexes = []
    let activeElements = document.evaluate(`//*[contains(@${BLUESTONE.bluestonePotentialMatchIndexes},'[')]`, document)
    let currentElement = null
    //retrieve indexes for the locators
    do {

        currentElement = activeElements.iterateNext()
        if (currentElement == null) {
            break
        }
        let matchIndexStr = currentElement.getAttribute(BLUESTONE.bluestonePotentialMatchIndexes)
        let potentialMatchList = JSON.parse(matchIndexStr)
        potentialMatchList.forEach(item => activeLocatorIndexes.push(item))
    }
    while (true)
    window.setLocatorStatus(activeLocatorIndexes)
}
function getElementByXpath(xpath, source = document) {
    let result = []
    let elements = document.evaluate(xpath, source)
    while (true) {
        let node = elements.iterateNext()
        if (node == null) break
        result.push(node)
    }
    return result

}
function getElementsByLocator(currentLocator) {
    let currentElementList = []

    if (currentLocator.startsWith('/') || currentLocator.startsWith('(')) {
        //current locator is xpath
        currentElementList = getElementByXpath(currentLocator)
    }
    else {
        //current selector is css selector
        currentElementList = document.querySelectorAll(currentLocator)
    }
    return currentElementList

}

/**
 * Scan Through all locators in the web page and mark potential match element to its index
 * At a given point of time, there will be 1 instance of scanLocator function running.
 * If there is 0 instance in the queue, then start function and add element to the queue, 
 * If there are 1 instance in the queue, quit current loop and push task into queue
 * If there are 2 instance in the queue alreayd, quit current function
 * we will pop the task toward the end. 
 * After poping queue, if there are still task remains, run it right away.
 * isMainThread switch is used to ensure the main thread will be executed regardless the # of elements in queue
 * in case there are 2 tasks in queue, without this switch, the scan locator will be stuck and never
 * get the chance to execute the subsequent tasks to clear the queue. As a result, the scan locator function
 * will fail
 * @returns 
 */
async function scanLocator() {
    globalVar.potentialMatchManager.scanLocator()

}



async function captureHtml(reason) {
    try {
        await window.captureHtml(reason)
    } catch (error) {

    }


}


async function captureScreenshot(reason, isMainThread) {
    if (globalVar.capturePicQueue.length >= 2 && isMainThread == false) {
        return
    }
    if (globalVar.capturePicQueue.length == 1 && isMainThread == false) {
        globalVar.capturePicQueue.push(reason)
        return
    }
    if (globalVar.capturePicQueue.length == 0) {
        globalVar.capturePicQueue.push(reason)
    }
    try {
        if (!globalVar.isFreezeMode)
            await window.captureScreenshot(reason)
    } catch (error) {

    }
    globalVar.capturePicQueue.shift()
    if (globalVar.capturePicQueue.length > 0) {
        captureScreenshot(globalVar.capturePicQueue[0], true)
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
    if (checkAttributeNameExists(BLUESTONE.bluestonePotentialMatchIndexes)
        || checkAttributeNameExists(BLUESTONE.previousbackground)
        || checkAttributeNameExists(BLUESTONE.bluestoneIframePath)) {
        return
    }

    // console.log(mutationsList)
    captureScreenshot('dom tree change')
    //only proceed change that is introduced by RPA engine or code change
    captureHtml('dom tree change')
    getFrameLocator()
    scanLocator()
    // console.log(mutationsList)
}

const observer = new MutationObserver(mutationObserverCallback);

const markElementSelectorIndex = function (currentLocator, index) {
    let currentElementList = []
    currentElementList = getElementsByLocator(currentLocator)
    //stop mark element operation if locator element did not match
    if (currentElementList.length != 1) return

    let currentElement = currentElementList[0]
    currentElement.setAttribute(BLUESTONE.bluestoneSelectedLocatorIndex, index)

}

// Start observing the target node for configured mutations
observer.observe(document, config);

//when scroll up and down, take screenshot
document.addEventListener('scroll', captureScreenshot)
document.addEventListener('animationstart', () => {
    console.log('Animation started');
    // captureHtml()
    // setTimeout(captureHtml, 1000)
    // setTimeout(captureHtml, 2000)
}, { capture: true });
document.addEventListener('animationend', () => {
    console.log('Animation ended');
    // captureHtml()
    //capture html after 800ms in case there are some animation
    // captureScreenshot('animation ended')

}, { capture: true });
captureHtml('page initialization')
// setInterval(captureHtml, 800)
captureScreenshot('initial capture')
getFrameLocator()
let bluestoneRegisteredLocator = await window.getLocator()
globalVar.potentialMatchManager = new PotentialMatchManager(BLUESTONE.bluestonePotentialMatchIndexes, getElementsByLocator)
globalVar.potentialMatchManager.updateBluestoneRegisteredLocator(bluestoneRegisteredLocator)
scanLocator()
const socket = io("http://localhost:3600");
socket.on(BLUESTONE.scanLocator, async function (data) {
    console.log('locator refreshing!')
    let bluestoneRegisteredLocator = await window.getLocator()
    globalVar.potentialMatchManager.updateBluestoneRegisteredLocator(bluestoneRegisteredLocator)
    await scanLocator()
    console.log('locator refreshed!')
});
socket.on("connect", () => {
    console.log(`socket io connect as ${socket.id}`); // x8WIv7-mJelg7on_ALbx
});
socket.on(BLUESTONE.markSelectorIndex, async function (data) {
    console.log(`Mark selector index :${JSON.stringify(data)}`)
    markElementSelectorIndex(data.locator, data.index)
})