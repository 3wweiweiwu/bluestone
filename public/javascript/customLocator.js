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

function createOutput(target = null, selector = null) {
    return { target, selector }
}


export function getLocator(element, selector) {
    const functionList = []
    let result = createOutput()
    for (let i = 0; i < functionList.length; i++) {
        let currentFunc = functionList[i]
        result = currentFunc(element, selector)
        //if target is not null, it indicates that locator is good to go
        if (result.target != null) break
    }
    if (result.target == null) result.target = element
    return result
}
