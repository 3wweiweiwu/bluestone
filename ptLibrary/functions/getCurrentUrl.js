/**
 * Based on process.env.BLUESTONE_URL, construct new url name based on current scope
 * @param {string} baseUrl 
 * @returns {string}
 */
module.exports = function (baseUrl) {
    let url = baseUrl
    if (process.env.BLUESTONE_URL != null) {
        let originalUrlComponent = new URL(url)
        let newUrlHost = new URL(process.env.BLUESTONE_URL)
        url = urljoin(newUrlHost.origin, originalUrlComponent.pathname, originalUrlComponent.search)
    }
    return url
}