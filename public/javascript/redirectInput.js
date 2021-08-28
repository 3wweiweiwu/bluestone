function redirectInputOnChange(event) {
    let value = event.target.value
    let queryKey = event.target.getAttribute('querykey')
    let index = event.target.getAttribute('index')
    window.location.replace(`?${queryKey}=${value}&index=${index}`)
}