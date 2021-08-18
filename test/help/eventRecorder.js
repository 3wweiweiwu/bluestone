import { finder } from 'https://medv.io/finder/finder.js'

const events = ['click']

events.forEach(item => {
    document.addEventListener('click', event => {
        const selector = finder(event.target)
        const position = event.target.getBoundingClientRect()
        const eventDetail = {
            event: item,
            selector,
            x: position.x,
            y: position.y,
            right: position.right,
            buttom: position.buttom,
            height: position.height,
            width: position.width

        }
        // new CustomEvent('eventDetected', { detail: eventDetail });
        window.logEvent(eventDetail)

        console.log(JSON.stringify(eventDetail))
    })
})
