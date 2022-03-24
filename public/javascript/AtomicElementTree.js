class AtomicObjectCategory {
    static TABLE = 'TABLE'
    static LIST = 'LIST'
}
//build relationship in between atomic element
class AtomicElementTreeNode {
    constructor(tooltip, text, textSize, textWeight, placeHolder, sourceElement, category, isTarget = false) {
        this.__tooltip = tooltip
        this.__text = text
        /**@type {Array<AtomicElementTreeNode>} */
        this.__children = []
        this.__source = sourceElement
        /**@type {AtomicElementTreeNode} */
        this.__parentNode = null
        this.__placeHolder = placeHolder
        this.__textSize = textSize
        if (textSize) {
            this.__textSize = this.__textSize.replace('px', '')
        }
        this.__textWeight = textWeight
        this.__id = this.uuidv4()
        this.__category = category
        this.__isTarget = isTarget
    }
    /**
     * Create atomic element based on element information
     * @param {HTMLElement} element 
     * @returns {AtomicElementTreeNode}
     */
    static parseFromElement(element) {
        let placeHolder = element.getAttribute('placeholder')
        let tooltip = element.getAttribute('Title')
        let text = element.innerText
        let textSize = window.getComputedStyle(element).fontSize
        let textWeight = window.getComputedStyle(element).fontWeight
        let atomicElement = new AtomicElementTreeNode(tooltip, text, textSize, textWeight, placeHolder, element)
        return atomicElement
    }
    /**
     * Parse atomic object 
     * @param {AtomicElementTreeNode} atomicObj 
     * @returns {AtomicElementTreeNode}
     */
    static parseFromObj(atomicObj) {
        let tooltip = atomicObj.__tooltip
        let text = atomicObj.__text
        let textSize = atomicObj.__textSize
        let textWeight = atomicObj.__textWeight
        let placeHolder = atomicObj.__placeHolder
        let category = atomicObj.__category
        let atomicNode = new AtomicElementTreeNode(tooltip, text, textSize, textWeight, placeHolder, null, category)
        atomicNode.__id = atomicObj.__id
        return atomicNode
    }
    uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    get isTarget() {
        return this.__isTarget
    }
    set isTarget(result) {
        this.__isTarget = result
    }
    get id() {
        return this.__id
    }
    set id(info) {
        this.__id = info
    }
    get textSize() {
        return this.__textSize
    }
    get textWeight() {
        return this.__textWeight
    }
    get parentNode() {
        return this.__parentNode
    }
    set parentNode(node) {
        this.__parentNode = node
    }
    get placeHolder() {
        return this.__placeHolder
    }
    get tooltip() {
        return this.__tooltip
    }
    set tooltip(tooltip) {
        this.__tooltip = tooltip
    }
    get text() {
        return this.__text
    }
    get sourceElement() {
        return this.__source
    }
    set sourceElement(source) {
        this.__source = source
    }
    get children() {
        return this.__children
    }
    set children(result) {
        this.__children = result
    }
    addChildren(nodeElement) {
        this.__children.push(nodeElement)
    }
    removeChildren(nodeElement) {
        this.__children = this.__children.filter(item => item != nodeElement)
    }
}
class AtomicElementTree {
    /**
     * 
     * @param {HTMLElement} targetElement 
     */
    constructor(targetElement) {
        /**@type {Array<AtomicElementTreeNode>} */
        this.__atomicElements = []
        this.__buildTreeForAtomicElement(targetElement)
        this.__rootNode = this.__getRootNode(this.__atomicElements)
    }
    /**
     * Get target element
     * @returns {AtomicElementTreeNode}
     */
    getTargetElement() {
        return this.__atomicElements.filter(item => item.isTarget)
    }
    /**
     * Based on current atomic elemnts, get root node. If atomic elements is empty, return null
     * @param {Array<AtomicElementTreeNode>} atomicElements 
     * @returns {AtomicElementTreeNode}
     */
    __getRootNode(atomicElements) {
        let rootNode = null
        if (this.__atomicElements.length > 0) {
            let current = this.__atomicElements[0]
            while (true) {
                let parent = current.parentNode
                if (parent == null) {
                    rootNode = current
                    break
                }
                current = parent
            }
        }
        return rootNode
    }
    static parse(str) {
        let pathList = JSON.parse(str)
        let atomicElementTree = new AtomicElementTree()
        atomicElementTree.id = pathList[0][pathList[0].length - 1].__id
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i]
            let atomicObj = path[0]
            let treeNode = AtomicElementTreeNode.parseFromObj(atomicObj)
            atomicElementTree.__atomicElements.push(atomicNode)
            for (let j = 1; j < path.length; j++) {
                let parentObj = path[j]
            }
        }

        return atomicElementTree

    }
    /**
     * Output page model into json format
     * @returns 
     */
    stringify() {
        let resultArray = []
        let backup = []
        //convert linked list into multiple arrays
        for (let i = 0; i < this.__atomicElements.length; i++) {
            let node = this.__atomicElements[i]
            backup.push({
                sourceElement: node.sourceElement,
                parentNode: node.parentNode,
                children: node.children
            })
            node.sourceElement = null
            node.parentNode = (node.parentNode == null) ? null : node.parentNode.__id
            let newChildren = node.children.map(item => item.__id)
            node.children = newChildren
            resultArray.push(node)
        }
        let result = JSON.stringify(resultArray)

        //restore attributes
        for (let i = 0; i < this.__atomicElements.length; i++) {
            let node = this.__atomicElements[i]
            backup.push({
                sourceElement: node.sourceElement,
                parentNode: node.parentNode,
                children: node.children
            })
            node.sourceElement = backup[i].sourceElement
            node.parentNode = backup[i].parentNode

            node.children = backup[i].children
            resultArray.push(node)
        }
        return result
    }
    __getParents(atomicTreeNode) {
        let currentTreeNode = this.__atomicElements.find(item => item.sourceElement == atomicTreeNode)
        let parentList = [currentTreeNode]
        while (currentTreeNode.parentNode != null) {
            parentList.push(currentTreeNode.parentNode)
            currentTreeNode = currentTreeNode.parentNode
        }
        return parentList
    }


    /**
     * Build path from starting element all the way to the top
     * @param {HTMLElement} element 
     * @param {HTMLElement} targetElement
     * @returns 
     */
    __buildPath(element, targetElement) {
        /**@type {AtomicElementTreeNode} */
        let lastAtomicElement = null
        let lastText = null
        while (true) {
            let atomicElement = AtomicElementTreeNode.parseFromElement(element)
            //if current atomic element has been defined in the past, we we will merge trees
            let parentElement = this.__atomicElements.find(ele => ele.sourceElement == element)
            if (parentElement) {
                if (lastAtomicElement) {
                    parentElement.addChildren(lastAtomicElement)
                    lastAtomicElement.parentNode = parentElement
                }
                lastAtomicElement = null
                lastText = null
                break
            }


            if (isElementAtomic(element, lastText) && !isHidden(element)) {
                //append qualified item to atomic list
                this.__atomicElements.push(atomicElement)
                //build up link between last atomic element and current element
                if (lastAtomicElement != null) {
                    atomicElement.children.push(lastAtomicElement)
                    lastAtomicElement.parentNode = atomicElement
                }
                //refresh last atomic element
                lastAtomicElement = atomicElement
                lastText = lastAtomicElement.text
            }

            if (element == targetElement && lastAtomicElement != null) {
                lastAtomicElement.isTarget = true
            }


            //if we are at the root level, we will just stop
            if (element.parentElement == null) {
                break
            }

            element = element.parentElement
        }


    }
    /**
     * Go all the way up to the top and find out e
     * @param {HTMLElement} targetElement
     */
    __buildTreeForAtomicElement(targetElement) {
        let allLeafElements = getAllLeafElements()
        for (let i = 0; i < allLeafElements.length; i++) {
            let currentElement = allLeafElements[i]

            this.__buildPath(currentElement, targetElement)
        }
    }
}




//get all visible atomic element
function queryVisibleAtomicElement(startElement = document) {
    let allElements = startElement.getElementsByTagName('*')
    let visibleElements = []
    for (let i = 0; i < allElements.length; i++) {
        let element = allElements[i]

        if (isElementAtomic(element) && !isHidden(element))
            visibleElements.push(element)
    }
    return visibleElements
}

/**
 * Get all leaf elements
 * @returns 
 */
function getAllLeafElements() {
    //if current element does not contains children, it must be bottom elements
    let allElements = document.getElementsByTagName('*')
    let leafElements = Array.from(allElements).filter(element => {
        return element.childElementCount == 0
    })
    return leafElements
}

/**
 * Test if element should be included in the Atomic Element Tree
 * A element is unique when it contains text node, tooltips, its tag name is input or img
 * @param {HTMLElement} element 
 * @param {string} previousText
 * @returns 
 */
function isElementAtomic(element, previousText) {


    //if current element contains text node and it contains info after trim
    //it must be atomic
    let childNodeArray = Array.from(element.childNodes)
    let uniqueTextNode = childNodeArray.find(node => {
        if (node.nodeType == Node.TEXT_NODE && node.data.trim() != '') {
            return true
        }
        return false
    })
    if (uniqueTextNode != null || element.innerText != previousText) {
        return true
    }


    //if current element has title, it must be a unique element    
    if (element.getAttribute('title') != null) {
        return true
    }
    //if current element is input or img, it must be a unique element
    if (element.tagName == 'INPUT' || element.tagName == 'IMG') {
        return true
    }
    return false

}

function getElementOnLeft(element) {
    let visibleElements = queryVisibleElement()
    let elementRect = element.getBoundingClientRect()
    let elementStickiness = getElementStickiness(element)

    let itemsOnLeft = visibleElements.filter(otherItem => {
        let otherItemStickiness = getElementStickiness(otherItem)
        let isStickinessConsistent = otherItemStickiness == elementStickiness

        let otherItemRect = otherItem.getBoundingClientRect()
        let otherItemLeftBound = otherItemRect.x + otherItemRect.width
        let otherItemBottomBound = otherItemRect.y + otherItemRect.height

        let isOtherElementAboveCurrent = elementRect.y > otherItemBottomBound
        let isOtherElementUnderCurrent = elementRect.y + elementRect.height < otherItemRect.y



        return elementRect.x > otherItemLeftBound && !isOtherElementAboveCurrent && !isOtherElementUnderCurrent && isStickinessConsistent
    })
    return itemsOnLeft
}

//go all the way to top to see if current item is sticky
function getElementStickiness(element) {
    let isSticky = false
    do {
        let pos = window.getComputedStyle(element).position
        isSticky = (pos == 'sticky')
        element = element.parentElement
    }
    while (element != null && !isSticky)
    return isSticky
}

function isHidden(el) {
    let tagBlackList = ['HTML']
    var style = window.getComputedStyle(el);
    let size = el.getBoundingClientRect()
    let styleInvisible = ((style.display === 'none') || (style.visibility === 'hidden'))
    if (styleInvisible) return styleInvisible


    let tagWrong = tagBlackList.includes(el.tagName)
    if (tagWrong) return tagWrong

    let sizeInvisible = (size.width == 0) || (size.height == 0)
    if (sizeInvisible) return sizeInvisible

}

export default AtomicElementTree
