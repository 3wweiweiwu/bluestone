/**
 * Based on process.env.BLUESTONE_URL, construct new url name based on current scope
 * @param {string} baseUrl 
 * @returns {string}
 */
module.exports = function (baseUrl) {
    let url = baseUrl
    if (process.env.BLUESTONE_URL != null && process.env.BLUESTONE_URL != '') {
        let originalUrlComponent = new URL(url)
        let newUrlHost = new URL(process.env.BLUESTONE_URL)
        originalUrlComponent.username = newUrlHost.username
        originalUrlComponent.password = newUrlHost.password
        originalUrlComponent.host = newUrlHost.host
        originalUrlComponent.protocol = newUrlHost.protocol
        url = originalUrlComponent.toString()
    }
    return url
}