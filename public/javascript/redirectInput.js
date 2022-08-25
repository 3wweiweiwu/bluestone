function redirectInputOnChange(event) {
    let value = event.target.value
    let queryKey = event.target.getAttribute('querykey')
    let index = event.target.getAttribute('index')
    let queryindex = event.target.getAttribute('queryIndex')
    value = encodeURIComponent(value)
    let decodedUri = (`?${queryKey}=${value}&${queryindex}=${index}`).replace(/#/g, '%23')
    window.location.replace(decodedUri)
}

function ajaxInputOnChange(event) {
    let value = event.target.value
    if (value == null) {
        value = event.target.getAttribute('value')
    }
    let queryKey = event.target.getAttribute('querykey')
    let index = event.target.getAttribute('index')
    let queryindex = event.target.getAttribute('queryIndex')
    value = encodeURIComponent(value)
    let decodedUri = (`?${queryKey}=${value}&${queryindex}=${index}`).replace(/#/g, '%23')
    fetch(decodedUri, { method: 'get' })
}