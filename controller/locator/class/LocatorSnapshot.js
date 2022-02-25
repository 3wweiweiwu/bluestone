class LocatorSnapshot {
    /**
     * @param {string} name
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {string} innerText 
     * @param {Array<string>} backupLocators 
     */
    constructor(name, x, y, width, height, innerText, backupLocators) {
        this.name = name
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.innerText = innerText
        this.backupLocators = backupLocators
    }
}
module.exports = LocatorSnapshot