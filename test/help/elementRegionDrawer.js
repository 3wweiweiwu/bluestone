import { finder } from 'https://medv.io/finder/finder.js'

document.addEventListener('mouseover', async event => {
    const selector = finder(event.target)
    await window.drawBorderOverElement(selector)

})

