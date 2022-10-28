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
export function getXPath(elm) {
    let target = elm
    var allNodes = document.getElementsByTagName('*');
    let segs = []
    for (segs = []; elm && elm.nodeType == 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id == elm.id) uniqueIdCount++;
                if (uniqueIdCount > 1) break;
            };
            if (uniqueIdCount == 1) {
                segs.unshift(`*[@id='${elm.getAttribute('id')}']`);
                break
            } else {
                segs.unshift(`*[@id='${elm.getAttribute('id')}' and local-name()='${elm.localName}']`);
            }
        } else if (elm.hasAttribute('class')) {
            segs.unshift(`*[@class='${elm.getAttribute('class')}' and local-name()='${elm.localName}']`);
            let itemWithClassName = document.getElementsByClassName(elm.className)
            if (itemWithClassName.length == 1) break

        } else {
            let i, sib
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName == elm.localName) i++;
            };
            segs.unshift(`*[local-name()='${elm.localName}']` + '[' + i + ']');
        };
    };
    let xpath = '//' + segs.join('/')
    let results = getElementByXpath(xpath)
    if (results.length == 1) return xpath
    for (let i = 0; i < results.length; i++) {
        if (results[i] == target) {
            return `(${xpath})[${i + 1}]`
        }
    }

}; 