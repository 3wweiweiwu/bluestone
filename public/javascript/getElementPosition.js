/**
 * get element location even though they are within iframe
 * @param {HTMLElement} element 
 * @returns {DOMRect}
 */
export function getElementPos(element) {

    /**@type {Array<DOMRect>} */
    let iframePos = []
    //build a queue of iframe
    let currentFrameElement = window
    let currentWindow = window
    while (true) {
        if (currentFrameElement.frameElement == null) {
            break
        }
        currentFrameElement = currentFrameElement.frameElement
        let leftPadding = window.getComputedStyle(currentFrameElement).getPropertyValue('padding-left').replace('px', '')
        let topPadding = window.getComputedStyle(currentFrameElement).getPropertyValue('padding-top').replace('px', '')
        if (currentFrameElement) {
            let pos = currentFrameElement.getBoundingClientRect()
            pos.x = pos.x + parseInt(leftPadding)
            pos.y = pos.y + parseInt(topPadding)

            iframePos.push(pos)
        }

    }
    let position = element.getBoundingClientRect()
    //calculate relative position of current element's iframe


    iframePos.forEach(pos => {

        position.x += pos.x
        position.y += pos.y
    })

    return position
}