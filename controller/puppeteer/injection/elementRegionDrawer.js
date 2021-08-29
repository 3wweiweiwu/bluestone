import { finder } from 'https://medv.io/finder/finder.js'

document.addEventListener('mouseover', event => {
    if (!window.isRecording()) return

    const selector = finder(event.target)
    const innerText = event.target.innerText
    window.logCurrentElement(selector, innerText)
    const previousStyle = event.target.style.border
    event.target.setAttribute('previousBorder', previousStyle)
    event.target.style.border = "3px solid #FF0000"

})

document.addEventListener("mouseout", event => {
    if (!window.isRecording()) return
    try {
        const previousStyle = event.target.getAttribute('previousBorder')
        if (previousStyle != null) {
            event.target.style.border = previousStyle
            event.target.removeAttribute('previousBorder')
        }
    } catch (error) {

    }

})