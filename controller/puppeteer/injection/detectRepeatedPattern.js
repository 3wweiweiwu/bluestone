//check similarity of two nodes
function isElementRepeated(source, target) {

}

//traverse through node and get attributes informaton
function getDomKeyProperties(node) {
    let childrenNodes = node.children
    let currentResult = getKeyAttributesForNode(node)
    let tagNameBlackList = ['NOSCRIPT', 'SCRIPT']

    //if current element is a text element, we will not traverse through its children
    if (isDirectTextDomElement(node))
        return currentResult

    for (let i = 0; i < childrenNodes.length; i++) {
        let childResult = getDomKeyProperties(childrenNodes[i])

        if (tagNameBlackList.includes(childResult.tagName))
            continue

        currentResult.children.push(childResult)
    }
    return currentResult
}
//identify direct element that contains text
function isDirectTextDomElement(element) {
    let childNodes = Array.from(element.childNodes)
    let textNodes = childNodes.find(node => node.nodeType == Node.TEXT_NODE && node.data.trim() != '')
    if (textNodes)
        return true
    else
        return false

}
//get key attributes of the node and return its value
function getKeyAttributesForNode(node) {
    let childrenNodes = node.children
    let attributes = []
    let tagName = node.tagName
    let className = node.className
    let children = []
    let attributeList = node.attributes
    let nodeAttributes = node.attributes
    for (let i = 0; i < node.attributes.length; i++) {
        let attributeName = nodeAttributes[i]
        attributes.push(attributeName.name)
    }
    //     return {className,tagName,children,attributes}
    return { tagName, children, attributes }
}
