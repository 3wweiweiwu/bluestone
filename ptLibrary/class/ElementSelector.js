class Locator {
    /**
     * 
     * @param {Array<string>} locator 
     * @param {string} screenshot 
     * @param {string} displayName 
     * @param {Array<string>} snapshot
     */
    constructor(locator, screenshot, displayName, snapshot) {
        this.locator = locator
        this.screenshot = screenshot
        this.displayName = displayName
        this.snapshot = snapshot
    }
}
module.exports = Locator