
class Locator {
    /**
     * Initialize new locator object
     * @param {Array<string>} locators xpath or css selector
     * @param {string} screenshot  path to the screenshot
     * @param {string} path  path specific locator object
     * @param {Array<string>} locatorSnapshot locator snapshot during defined time
     */
    constructor(locators, screenshot, path, locatorSnapshot) {
        this.Locator = locators
        this.screenshot = screenshot
        this.path = path
        this.selector = false
        this.locatorSnapshot = locatorSnapshot
    }
}

module.exports = Locator