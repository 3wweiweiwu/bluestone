import { finder } from 'https://medv.io/finder/finder.js'

const EVENTCONST = {
    click: 'click',
    change: 'change',
    dblclick: 'dblclick',
    keydown: 'keydown',
}

/**
 * This function will add event listener for all dom element
 * 
 * implementation detail: 
 * This function relys on /exposure/logEvent function to communicate the event back to puppeteer
 * its class should be in sync with puppeteer/classes/uievent.js
*/

Object.keys(EVENTCONST).forEach(item => {
    document.addEventListener(item, event => {
        const selector = finder(event.target)
        const position = event.target.getBoundingClientRect()
        const targetInnerText = event.target.innerText
        let parameter = null
        let command = item
        let targetPicPath = ''
        switch (item) {
            case EVENTCONST.change:
                parameter = event.target.value
                break;
            case EVENTCONST.keydown:
                //currently, we only support enter and esc key
                parameter = event.code
                switch (parameter) {
                    case 'Enter':
                        break;
                    case 'Escape':
                        break;
                    default:
                        //if we see combo key ctrl-q, we will call in-browser plugin
                        if (event.ctrlKey && event.key === 'q') {
                            command = null
                            parameter = null
                            break
                        }
                        //otherwise, we are not going to record any other operation
                        return
                }
                break;
            default:
                break;
        }
        const eventDetail = {
            command: command,
            target: selector,
            parameter: parameter,
            targetInnerText: targetInnerText,
            targetPicPath: targetPicPath,
            pos: {
                x: position.x,
                y: position.y,
                right: position.right,
                buttom: position.buttom,
                height: position.height,
                width: position.width
            }


        }
        // new CustomEvent('eventDetected', { detail: eventDetail });
        window.logEvent(eventDetail)

        // console.log(JSON.stringify(event))
    })
})

//draw rectangle and return the selector and inner text of element mouse hover on
document.addEventListener('mouseover', event => {
    if (window.isRecording()) {
        const selector = finder(event.target)
        const innerText = event.target.innerText
        let position = {}
        try {
            position = event.target.getBoundingClientRect()
        } catch (error) {
            console.log(error)
        }



        window.logCurrentElement(selector, innerText, position.x, position.y, position.height, position.width)
        const previousStyle = event.target.style.backgroundColor
        event.target.setAttribute('previousBackground', previousStyle)
        event.target.style.backgroundColor = 'rgba(140, 99, 255,0.7)'
    }



})

document.addEventListener("mouseout", event => {
    if (!window.isRecording()) return
    try {
        const previousStyle = event.target.getAttribute('previousBackground')
        if (previousStyle != null) {
            event.target.style.backgroundColor = previousStyle
            event.target.removeAttribute('previousBackground')
        }
    } catch (error) {

    }

})