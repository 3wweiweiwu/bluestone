class Locator {
    /**
     * 
     * @param {Array<string>} locator 
     * @param {string} screenshot 
     * @param {string} displayName 
     */
    constructor(locator, screenshot, displayName) {
        this.locator = locator
        this.screenshot = screenshot
        this.displayName = displayName
    }
}
module.exports = Locator