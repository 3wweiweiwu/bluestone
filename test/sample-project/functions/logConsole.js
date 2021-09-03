const locator = require('../bluestone-locator')
/**
 * Log Result {@link locator}
 * @name Log-Report
 * @param {string} text1 
 * @param {string} text2 
 * @param {import('../bluestone-locator.js')}
 * @requires locator.todoPage.todoText
 * 
 */
module.exports = function (text1, text2) {
    console.log(`text1:${text1} text2:${text2}`)
}