let config = require('../../../config')
/**
 * go through url black list and decide if we should navigate to the current url
 * @param {string} url 
 * @returns {boolean}
 */
module.exports = function (url) {
    for (let i = 0; i < config.code.urlBlackList.length; i++) {
        let currentPattern = config.code.urlBlackList[i]
        let re = new RegExp(currentPattern)
        if (re.test(url)) {
            return true
        }

    }

    return false
}