const fs = require('fs').promises
/**
 * Create a module script block and run script there
 * @param {import('puppeteer-core').Page} page
 * @param {string} injectionPath 
 */
module.exports = async function (page, injectionPath) {

    let eventRecorderScript = (await fs.readFile(injectionPath)).toString()
    let registerEvent = async function (eventRecorderScript) {
        setTimeout(() => {
            try {
                //add script block
                let finderScript = document.createElement("script");
                finderScript.setAttribute('type', 'module')
                finderScript.innerHTML = eventRecorderScript
                document.body.appendChild(finderScript);
            } catch (error) {

            }
        }, 800)

    }
    await page.evaluateOnNewDocument(registerEvent, eventRecorderScript)

}