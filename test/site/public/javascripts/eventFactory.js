var socket = io();
socket.on("www", (obj) => {
    console.log(`Message Received: ${JSON.stringify(obj)}`);
    let targetId = obj.target;
    let eventName = obj.event;

    let arg = {}
    if (obj.arg != '') {
        arg = JSON.parse(obj.arg);
    }


    let target = document.getElementById(obj.target);
    let event = new Event(obj.event);
    event;
    //based on the event and target prepare env
    switch (obj.event) {
        case "change":
            target.value = obj.arg;
            break;
        case "keydown":
            //if ctrl key present, then set the property to be true
            if (arg.ctrlKey) {
                Object.defineProperty(event, "ctrlKey", {
                    writable: false,
                    value: true,
                });
            }
            if (arg.code) {
                Object.defineProperty(event, "code", {
                    writable: false,
                    value: arg.code,
                });
            }
            if (arg.key) {
                Object.defineProperty(event, "key", {
                    writable: false,
                    value: arg.key,
                });
            }

            break;
        case "submit":
            target.submit()
            return
        default:
            break;
    }

    //freeeze target within the event

    Object.defineProperty(event, "target", {
        writable: false,
        value: target,
    });
    document.dispatchEvent(event);
    console.log(target);
    console.log(event);
});
