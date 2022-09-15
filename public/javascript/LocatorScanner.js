class LocatorEntry {
    /**
     * 
     * @param {HTMLElement} target 
     */
    constructor(target) {
        /**@type {number[]} */
        this.potentialMatch = []
        /** @type {HTMLElement} */
        this.target = target

        let rect = target.getBoundingClientRect()
        this.x = rect.x
        this.y = rect.y
        this.width = rect.width
        this.height = rect.height
        this.midX = rect.x + rect.width / 2
        this.midY = rect.y + rect.height / 2
    }
    /**
     * update potential match inforamtion
     * @param {number} matchIndex 
     */
    updatePotentialMatch(matchIndex) {
        let uniqueSet = new Set([...this.potentialMatch, matchIndex])
        this.potentialMatch = [...uniqueSet]
    }
}
class ElementCoordinationManager {
    constructor() {
        /**@type {Object.<string,HTMLElement[]>} */
        this.dict = {}
        this.initialize()
    }
    initialize() {
        let elements = Array.from(document.getElementsByTagName('*'))
        for (let element of elements) {
            let pos = element.getBoundingClientRect()
            let midX = Math.round(pos.x + pos.width / 2)
            let midY = Math.round(pos.y + pos.height / 2)
            //ignore elements that is not visible
            if (midX <= 0 && midY <= 0) {
                continue
            }
            if (pos.width == 0 && pos.height == 0) {
                continue
            }


            let key = this.getKey(midX, midY)
            if (this.dict[key] == null) {
                this.dict[key] = []
            }

            this.dict[key].push(element)
        }
    }
    getKey(midX, midY) {
        return `${midX},${midY}`
    }
    /**
     * 
     * @param {LocatorEntry} entry 
     * @returns {HTMLElement[]}
     */
    getOverlapsedElementsToLocatorEntry(entry) {
        let result = []
        let pos = entry.target.getBoundingClientRect()
        let midX = Math.round(pos.x + pos.width / 2)
        let midY = Math.round(pos.y + pos.height / 2)
        let key = this.getKey(midX, midY)
        if (this.dict[key] == null) {
            result = []
        }
        else {
            result = this.dict[key]
        }
        return result
    }
}
export class PotentialMatchManager {
    constructor(bluestonePotentialMatchIndexesConst, getElementsByLocator) {
        this.bluestonePotentialMatchIndexesConst = bluestonePotentialMatchIndexesConst
        /** @type {LocatorEntry[]} */
        this.currentPotentialMatchList = []
        /** @type {LocatorEntry[]} */
        this.proposedPotentialMatchList = []
        this.scanLocatorQueue = []
        this.lastLocatorScanTime = Date.now()
        this.bluestoneRegisteredLocator = []
        this.getElementsByLocator = getElementsByLocator
        this.waitTime = 1000

    }

    /**
     * @param {LocatorEntry[]} sourceList
     * @param {HTMLElement} target 
     */
    getElement(sourceList, target) {
        return sourceList.find(item => item.target == target)
    }
    updateBluestoneRegisteredLocator(locators) {
        this.bluestoneRegisteredLocator = locators
    }
    /**
     * update potential match information to the target
     * if no match if found, create element
     * @param {HTMLElement} target 
     * @param {number} index 
     * @returns {number[]} list of index of matched locator
     */
    addPotentialMatchToTarget(target, index) {

        let locatorEntry = this.getElement(this.proposedPotentialMatchList, target)


        if (locatorEntry == null) {
            locatorEntry = new LocatorEntry(target)
            this.proposedPotentialMatchList.push(locatorEntry)
        }
        locatorEntry.updatePotentialMatch(index)

        return locatorEntry

    }
    /**
     * Define elements based on the position check
     * If an undefined element's mid point is equivalent of a defined element's mid point
     * Mark undefined element's locator to be the same as defined element
     * Do this because some tims, there can be two layers in same location
     * One layer is stable but it is on the bottom, user will interact with top element whose locator
     * is unstable. This method can help average user to interact with specific location without worrying
     * about how to define elements on the front
     * 
     * Will only perform this feature on undefined element beause I am afriad if two layers of elements
     * both have been defined, adding additional layer of elements could cause confusion, as user try
     * to interact with 1st layer, 2nd layer come up and 2nd layer may not have the feature we want
     * @param {ElementCoordinationManager} coordinationMgr 
     * @param {LocatorEntry} locatorEntry
     */
    async defineElementBasedOnPosition(coordinationMgr, locatorEntry) {
        let elements = coordinationMgr.getOverlapsedElementsToLocatorEntry(locatorEntry)
        for (const ele of elements) {
            let proposedElement = this.getElement(this.proposedPotentialMatchList, ele)
            //current element has been defined already
            if (proposedElement != null)
                continue
            //skip elemnt that cannot pass mid point test
            locatorEntry.potentialMatch.forEach(index => {
                this.addPotentialMatchToTarget(ele, index)
            })

        }
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
     * @param {boolean} isMainThread if it is main thread, we will execute regardless number of task in queue
     * @returns 
     */
    async scanLocator(isMainThread = false) {


        if (this.scanLocatorQueue.length >= 2 && isMainThread == false) {
            return
        }
        if (this.scanLocatorQueue.length == 1 && isMainThread == false) {
            this.scanLocatorQueue.push('')
            return
        }
        if (this.scanLocatorQueue.length == 0) {
            this.scanLocatorQueue.push('')
        }
        let currentTimeStamp = Date.now()
        if ((currentTimeStamp - this.lastLocatorScanTime) < this.waitTime) {
            await new Promise(resolve => setTimeout(resolve, this.waitTime))
        }

        /** @type {Array<import('../../locator/index').Locator>} */
        let startTime = Date.now()

        let currentLocatorList = this.bluestoneRegisteredLocator
        let getLocatorTime = Date.now()
        //add potential match to elments who's region contains other element's mid point.
        //We do this because we might use other element to identify current element
        let coordinationManager = new ElementCoordinationManager()
        //clean up all 
        let scanLocatorStartTime = Date.now()
        for (let i = 0; i < currentLocatorList.length; i++) {
            currentLocatorList[i].selector = ''
            let locator = currentLocatorList[i]
            let currentLocatorOptions = locator.Locator
            let currentElement = null
            let currentLocator


            for (let locatorOptionIndex = 0; locatorOptionIndex < currentLocatorOptions.length; locatorOptionIndex++) {

                currentLocator = currentLocatorOptions[locatorOptionIndex]
                let currentElementList = []
                try {
                    currentElementList = this.getElementsByLocator(currentLocator)
                } catch (error) {
                    console.log(`Issue on locator at index:${i},locator:${currentLocator}`)
                    console.log(error)
                    continue
                }

                //if current locator find element, break current loop to save time
                if (currentElementList.length == 1) {
                    currentElement = currentElementList[0]
                    break
                }
            }

            if (currentElement != null) {
                //UI elemnet found, update its attribute
                let locatorEntry = this.addPotentialMatchToTarget(currentElement, i)
                await this.defineElementBasedOnPosition(coordinationManager, locatorEntry)
            }

        }
        let scanLocatorCompleteTime = Date.now()

        this.applyChange()
        let applyChangeCompleteTime = Date.now()
        this.scanLocatorQueue.pop()
        this.lastLocatorScanTime = Date.now()
        console.log(`
            get locator:${getLocatorTime - startTime}
            scan locator:${scanLocatorStartTime - scanLocatorCompleteTime},
            apply change: ${applyChangeCompleteTime - scanLocatorCompleteTime}
            total locator length: ${currentLocatorList.length},
            scanLocatorTaskQeueu: ${this.scanLocatorQueue.length},
            proposed potential match list: ${this.currentPotentialMatchList.length}
            isMainThread: ${isMainThread}
        `)
        console.log(this.currentPotentialMatchList)
        this.waitTime = scanLocatorCompleteTime - scanLocatorStartTime
        if (this.scanLocatorQueue.length > 0) {
            this.scanLocator(true)

        }

    }
    applyChange() {

        //remove elements that can no longer be found -proposed:no, current:yes
        let pendingDeleteList = this.currentPotentialMatchList.filter(current => {
            let locatorEntry = this.getElement(this.proposedPotentialMatchList, current.target)
            return locatorEntry == null
        })
        pendingDeleteList.forEach(item => {
            try {
                item.target.removeAttribute(this.bluestonePotentialMatchIndexesConst)
            } catch (error) {

            }
        })
        //update attributes
        //proposed: yes, current:no
        //proposed yes, current:yes but different
        let pendingUpdateList = this.proposedPotentialMatchList.filter(proposedElement => {
            let currentElement = this.getElement(this.currentPotentialMatchList, proposedElement.target)
            //proposed yes, current:no, it means we need to update this
            if (currentElement == null) return true

            //proposed yes, current:yes, diff two list from two ends

            let diffEntryFromCurrent = currentElement.potentialMatch.find(item => !proposedElement.potentialMatch.includes(item))
            let diffEntryFromProposed = proposedElement.potentialMatch.find(item => !currentElement.potentialMatch.includes(item))

            if (diffEntryFromCurrent == null && diffEntryFromProposed == null)
                return false
            else
                return true
        })
        pendingUpdateList.forEach(item => {
            try {
                item.target.setAttribute(this.bluestonePotentialMatchIndexesConst, JSON.stringify(item.potentialMatch))
            } catch (error) {

            }
        })

        //update potential match list and reset proposed list
        this.currentPotentialMatchList = this.proposedPotentialMatchList
        this.proposedPotentialMatchList = []


    }
}