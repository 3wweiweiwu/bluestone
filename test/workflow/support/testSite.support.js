const axios = require('axios').default
const testConfig = require('../testConfig')
const app = require('../../site/app').server
class TestSite {
    constructor() {
        this.url = `http://localhost:${testConfig.testSite.port}`
        this.singlePageHappyPath = `${this.url}/site/singlePageHappyPath.html`
        this.app = null
    }

    async launchApp() {
        return new Promise((resolve) => {
            try {
                this.app = app.listen(testConfig.testSite.port, () => {
                    resolve()
                })
            } catch (error) {
                console.log()
            }

        })
    }
    async closeApp() {
        return new Promise((resolve) => {
            this.app.close(resolve)
        })
    }
    async getMainPage() {
        let res = await axios.get(`${this.url}`)
        return res
    }
    /**
     * 
     * @param {'keydown'|'click'|'change'} event event name
     * @param {*} target the id of the target
     * @param {*} arg additional argument you want to parse in
     * @returns 
     */
    async sendOperation(event, target, arg = '') {
        let res = await axios.post(`${this.url}/operation`, {
            event: event,
            target: target,
            arg: arg
        })

        return res
    }
}
module.exports = TestSite