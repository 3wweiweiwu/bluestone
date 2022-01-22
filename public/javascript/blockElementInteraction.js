

export function setStateToAllEvents(isBlocked, bluestoneLockedKey, bluestonePrevDisableStatus) {
    let bluestonePrefix = bluestonePrevDisableStatus
    let elements = [...document.getElementsByTagName('*')]
    if (isBlocked) {
        elements.forEach(item => blockEventsForElement(item, bluestonePrefix, bluestoneLockedKey))
        disableAllElements(bluestonePrevDisableStatus, bluestoneLockedKey)
    }
    else {
        enableAllElements(bluestonePrevDisableStatus, bluestoneLockedKey)
        elements.forEach(item => activeEventsForElement(item, bluestonePrefix, bluestoneLockedKey))
    }

}
function blockEventsForElement(element, bluestonePrefix, bluestoneLockedKey) {
    //mark lock key for current element
    element.setAttribute(bluestoneLockedKey, 'locked')

    let allEvent = element.getEventListeners()
    let eventNameList = Object.keys(allEvent).filter(item => !item.includes(bluestonePrefix))
    for (const eventName of eventNameList) {
        let eventObjArray = allEvent[eventName]
        let bluestoneEventName = bluestonePrefix + eventName

        //if current bluestone event has been marked, we will skip it
        if (eventNameList.includes(bluestoneEventName))
            continue
        //redirect current event to bluestone event so that we can block it
        for (const eventObj of eventObjArray) {
            let listener = eventObj.listener
            let useCapture = eventObj.useCapture
            element.addEventListener(bluestoneEventName, listener, useCapture)
            element.removeEventListener(eventName, listener, useCapture)
        }


    }

}
function activeEventsForElement(element, bluestonePrefix, bluestoneLockedKey) {
    //mark lock key for current element
    element.removeAttribute(bluestoneLockedKey)
    let allEvent = element.getEventListeners()
    //get bluestone events
    let eventNameList = Object.keys(allEvent).filter(item => item.includes(bluestonePrefix))
    for (const bluestoneEventName of eventNameList) {
        let eventObjArray = allEvent[bluestoneEventName]
        let eventName = bluestoneEventName.replace(bluestonePrefix, '')


        //redirect current event to bluestone event so that we can block it
        for (const eventObj of eventObjArray) {
            let listener = eventObj.listener
            let useCapture = eventObj.useCapture
            element.removeEventListener(bluestoneEventName, listener, useCapture)
            element.addEventListener(eventName, listener, useCapture)
        }

    }

}
function disableAllElements(bluestonePrevDisableStatus, bluestoneLockedKey) {
    let tagList = ['input', 'button']
    for (const tag of tagList) {
        let elementList = [...document.getElementsByTagName(tag)]

        for (const element of elementList) {
            let prevDisableStatus = element.getAttribute(bluestonePrevDisableStatus)
            if (prevDisableStatus == null)
                prevDisableStatus = JSON.stringify(element.disabled)
            element.setAttribute(bluestonePrevDisableStatus, prevDisableStatus)
            element.disabled = true

            //mark lock key for current element
            element.setAttribute(bluestoneLockedKey, 'locked')

        }
    }
}
function enableAllElements(bluestonePrevDisableStatus, bluestoneLockedKey) {
    let tagList = ['input', 'button']
    for (const tag of tagList) {
        let elementList = [...document.getElementsByTagName(tag)]

        for (const element of elementList) {
            let prevDisableStatus = JSON.parse(element.getAttribute(bluestonePrevDisableStatus))
            element.removeAttribute(bluestonePrevDisableStatus)
            element.disabled = prevDisableStatus
            //mark lock key for current element
            element.removeAttribute(bluestoneLockedKey)

        }
    }
}