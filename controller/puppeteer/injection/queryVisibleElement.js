class AtomicObjectCategory {
    static TABLE = 'TABLE'
    static LIST = 'LIST'
}
//build relationship in between atomic element
class AtomicElementTreeNode {
    constructor(tooltip, text, textSize, textWeight, placeHolder, sourceElement, category) {
        this.__tooltip = tooltip
        this.__text = text
        this.__children = []
        this.__source = sourceElement
        this.__parentNode = null
        this.__placeHolder = placeHolder
        this.__textSize = textSize
        if (textSize) {
            this.__textSize = this.__textSize.replace('px', '')
        }
        this.__textWeight = textWeight
        this.__id = this.uuidv4()
        this.__category = category
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
    constructor() {
        this.__atomicElements = []
        this.__rootNode = new AtomicElementTreeNode(null, null, null, null, null, document)
        this.__parentList = [this.__rootNode]
    }
    buildTree() {

        this.__buildTreeForAtomicElement()
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
    stringify() {
        let resultArray = []
        //convert linked list into multiple arrays
        for (let i = 0; i < this.__atomicElements.length; i++) {
            let node = this.__atomicElements[i]
            let nodeList = this.__getParents(node.sourceElement)
            resultArray.push(nodeList)
        }
        //clean up children and parent to avoid circular references
        resultArray.forEach(line => {
            line.forEach(node => {
                node.children = node.children.map((item, index) => {
                    if (item.id)
                        return item.id
                    else
                        return item
                })
                if (node.parentNode != null)
                    node.parentNode = node.parentNode.id
                node.sourceElement = null
            })
        })
        return JSON.stringify(resultArray)
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
    //get common parent for list of atomic elements
    getCommonParentForAtomicElement(atomicElementList) {

        let currentUnion = this.__getParents(atomicElementList[0])
        //convt current union from source to tree nodes
        this.__parentList

        for (let i = 1; i < atomicElementList.length; i++) {
            let currentParentList = this.__getParents(atomicElementList[i])
            currentUnion = currentUnion.filter(item => currentParentList.includes(item))
        }
        return currentUnion
    }

    //trim down single parent node to simplify the tree for the search and analysis
    __trimDownSingleParentNodes() {
        //get rid of single parent node who only have 1 child in order to make hierachy obvious

        let trimmedNodeList = [] //save trimmed node in order to improve trim down performance
        for (let i = 0; i < this.__atomicElements.length; i++) {
            let atomicNode = this.__atomicElements[i]
            let currentNode = atomicNode.parentNode
            while (true) {
                //if current node has been trimmed in the past, we will just stop the loop as we know the parent has been cleaned already
                if (trimmedNodeList.includes(currentNode)) {
                    break
                }

                //if current node only have 1 child, we will link the only child to its grandparents
                //and remove current element from the node

                if (currentNode.children.length == 1) {
                    let singleChild = currentNode.children[0]
                    let parentNode = currentNode.parentNode
                    //build 2-way link
                    parentNode.addChildren(singleChild)
                    parentNode.removeChildren(currentNode)
                    singleChild.parent = parentNode

                    //get rid of current node from the list
                    this.__parentList = this.__parentList.filter(item => item != currentNode)
                }
                //add current node to the trimmed list
                trimmedNodeList.push(currentNode)
                currentNode = currentNode.parentNode

                //stop when we reach the root
                if (currentNode == this.__rootNode)
                    break
                if (currentNode == null) {
                    console.log()
                }
            }
        }

    }
    /**
     * Build path from starting element all the way to the top
     * @param {HTMLElement} element 
     * @returns 
     */
    __buildPath(element) {
        /**@type {AtomicElementTreeNode} */
        let lastAtomicElement = null
        let lastText = null
        while (true) {
            let atomicElement = AtomicElementTreeNode.parseFromElement(element)

            //if current atomic element has been defined in the past, we we will merge trees
            let parentElement = this.__atomicElements.find(ele => ele.sourceElement == element)
            if (parentElement) {
                atomicElement.children.forEach(item => parentElement.addChildren(item))
                lastAtomicElement = parentElement
                break
            }

            //if current element is visible, atomic or belongs to list category, add element to atomic list
            if (lastAtomicElement != null) {
                lastText = lastAtomicElement.text
            }
            if (isElementAtomic(element, lastText) && !isHidden(element)) {
                //append qualified item to atomic list
                this.__atomicElements.push(atomicElement)
                //build up link between last atomic element and current element
                if (lastAtomicElement != null) {
                    atomicElement.children.push(lastAtomicElement)
                }
                //refresh last atomic element
                lastAtomicElement = atomicElement
            }



            //if we are at the root level, we will just stop
            if (element.parentElement == null) {
                break
            }

            element = element.parentElement
        }
        //set root element to be last atomic element for now
        this.__rootNode = lastAtomicElement

    }
    /**
     * Go all the way up to the top and find out e
     */
    __buildTreeForAtomicElement() {
        let allLeafElements = getAllLeafElements()
        let parentNodeList = []
        for (let i = 0; i < allLeafElements.length; i++) {
            let currentElement = allLeafElements[i]

            this.__buildPath(currentElement)
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
