function redirectInputOnChange(event) {
    let value = event.target.value
    let queryKey = event.target.getAttribute('querykey')
    let index = event.target.getAttribute('index')
    let queryindex = event.target.getAttribute('queryIndex')
    window.location.replace(`?${queryKey}=${value}&${queryindex}=${index}`)
}