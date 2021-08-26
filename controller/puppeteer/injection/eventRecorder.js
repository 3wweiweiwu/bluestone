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
        let parameter = null
        let command = item
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
                        //if we see combo key ctrl-q, we will extract the attribute
                        if (event.ctrlKey && event.key === 'q') {
                            command = null
                            parameter = null
                            break
                        }
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

        console.log(JSON.stringify(event))
    })
})
