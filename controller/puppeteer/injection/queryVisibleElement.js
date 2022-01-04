//build relationship in between atomic element
class AtomicElementTreeNode {
    constructor(tooltip, text, textSize, textWeight, placeHolder, sourceElement) {
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
    }
    static parse(atomicObj) {
        let tooltip = atomicObj.__tooltip
        let text = atomicObj.__text
        let textSize = atomicObj.__textSize
        let textWeight = atomicObj.__textWeight
        let placeHolder = atomicObj.__placeHolder
        let atomicNode = new AtomicElementTreeNode(tooltip, text, textSize, textWeight, placeHolder, null)
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
        this.__current = null
        this.__rootNode = new AtomicElementTreeNode(null, null, null, null, null, document)
        this.__parentList = [this.__rootNode]
    }
    buildTree() {

        this.__buildTreeForAtomicElement()
        this.__trimDownSingleParentNodes()
    }
    static parse(str) {
        let pathList = JSON.parse(str)
        let atomicElementTree = new AtomicElementTree()
        atomicElementTree.id = pathList[0][pathList[0].length - 1].__id
        for (let i = 0; i < pathList.length; i++) {
            let path = pathList[i]
            let atomicObj = path[0]
            let treeNode = AtomicElementTreeNode.parse(atomicObj)
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
    __addAtomicElement(tooltip, text, textSize, textWeight, placeHolder, sourceElement) {
        let atomicElement = new AtomicElementTreeNode(tooltip, text, textSize, textWeight, placeHolder, sourceElement)
        this.__current = atomicElement
        this.__atomicElements.push(atomicElement)
        //if current atomic element is served as other element's parent node, we will just append it to itself
        //by doing this, we can keep atomic element and its parent seperate. This will make the logic easier
        //I also want to get rid of complicated tree search process.
        let parentElement = this.__parentList.find(ele => ele.sourceElement == sourceElement)

        //if current element is a parent element as well, we will just add children and stop going forward
        //becauase we don't need to re-add things again
        if (parentElement) {
            parentElement.addChildren(atomicElement)
            atomicElement.parentNode = parentElement
            this.__current = parentElement
            return
        }

        //if current element is not parent of any tree, we will extend current branch and add current element to parent node list

        while (true) {

            //otherwise, current parent node is brand new, we will register parent element
            let newParent = new AtomicElementTreeNode(null, null, null, null, null, this.__current.sourceElement.parentElement)
            parentElement = this.__parentList.find(ele => ele.sourceElement == newParent.sourceElement)
            //if parent element is already part of parent list, we will just add current element and stop
            if (parentElement) {
                parentElement.addChildren(this.__current)
                this.__current.parentNode = parentElement
                break
            }

            newParent.addChildren(this.__current)
            this.__current.parentNode = newParent
            this.__parentList.push(newParent)
            this.__current = newParent



            if (this.__current.sourceElement.parentElement == null) {
                this.__rootNode.addChildren(this.__current)
                this.__current.parentNode = this.__rootNode
                break
            }
        }


    }
    __buildTreeForAtomicElement() {
        let allElements = queryVisibleAtomicElement()
        let parentNodeList = []
        for (let i = 0; i < allElements.length; i++) {
            let currentElement = allElements[i]
            let currentParent = currentElement.parentElement
            let placeHolder = currentElement.getAttribute('placeholder')
            let title = currentElement.getAttribute('Title')
            let innerText = currentElement.innerText
            let fontSize = window.getComputedStyle(currentElement).fontSize
            let fontWeight = window.getComputedStyle($0).fontWeight
            this.__addAtomicElement(title, innerText, fontSize, fontWeight, placeHolder, currentElement)
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

//test if element is atomic
//We expect element either to contain unique text or has no children elements
function isElementAtomic(element) {
    //if current element does not contains children, it must be atomic
    if (element.childElementCount == 0) return true

    //if current element contains text node and it contains info after trim
    //it must be atomic
    let childNodeArray = Array.from(element.childNodes)
    let uniqueTextNode = childNodeArray.find(node => {
        if (node.nodeType == Node.TEXT_NODE && node.data.trim() != '') {
            return true
        }
        return false
    })
    if (uniqueTextNode != null) {
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
    let tagBlackList = ['HTML', 'BODY']
    var style = window.getComputedStyle(el);
    let size = el.getBoundingClientRect()
    let styleInvisible = ((style.display === 'none') || (style.visibility === 'hidden'))
    if (styleInvisible) return styleInvisible


    let tagWrong = tagBlackList.includes(el.tagName)
    if (tagWrong) return tagWrong

    let sizeInvisible = (size.width == 0) || (size.height == 0)
    if (sizeInvisible) return sizeInvisible

}
