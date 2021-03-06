const fs = require('fs').promises
const config = require('../../../config')
/**
 * Create a module script block and run script there
 * @param {import('puppeteer-core').Page} page
 * @param {string} injectionPath 
 */
module.exports = async function (page, injectionPath) {

    let eventRecorderScript = (await fs.readFile(injectionPath)).toString()
    //replace place holder http://localhost:3600 with current port
    let currentUrl = `http://localhost:${config.app.port}`
    eventRecorderScript = eventRecorderScript.split('http://localhost:3600').join(currentUrl)
    let registerEvent = async function (eventRecorderScript) {
        while (true) {
            await new Promise(resolve => setTimeout(resolve, 50))
            if (document != null) break
        }

        try {
            //add script block
            let finderScript = document.createElement("script");
            finderScript.setAttribute('type', 'module')
            finderScript.innerHTML = eventRecorderScript
            document.body.appendChild(finderScript);
        } catch (error) {

        }

    }
    await page.evaluateOnNewDocument(registerEvent, eventRecorderScript)

}