class BluestoneFunc {
    constructor(func, locators = [{ locator: ['invalid_locator'] }]) {
        this.func = func
        this.locators = locators
    }
}
module.exports = BluestoneFunc