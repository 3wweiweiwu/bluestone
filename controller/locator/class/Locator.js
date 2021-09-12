
class Locator {
    /**
     * Initialize new locator object
     * @param {Array<string>} locators xpath or css selector
     * @param {string} screenshot  path to the screenshot
     * @param {string} path  path specific locator object
     */
    constructor(locators, screenshot, path) {
        this.Locator = locators
        this.screenshot = screenshot
        this.path = path
        this.selector = false
    }
}

module.exports = Locator