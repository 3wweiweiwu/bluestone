import { finder } from 'https://medv.io/finder/finder.js'

document.addEventListener('mouseover', event => {
    const selector = finder(event.target)

    const previousStyle = event.target.style.border
    event.target.setAttribute('previousBorder', previousStyle)
    event.target.style.border = "3px solid #FF0000"

})

document.addEventListener("mouseout", event => {
    try {
        const previousStyle = event.target.getAttribute('previousBorder')
        if (previousStyle != null) {
            event.target.style.border = previousStyle
            event.target.removeAttribute('previousBorder')
        }
    } catch (error) {

    }

})