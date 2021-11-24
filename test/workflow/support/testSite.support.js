const axios = require('axios').default
const testConfig = require('../config')
const app = require('../../site/app').app
class TestSite {
    constructor() {
        this.url = `http://localhost:${testConfig.testSite.port}`
        this.app = null
    }

    async launchApp() {
        return new Promise((resolve) => {
            this.app = app.listen(testConfig.testSite.port, () => {
                resolve()
            })
        })
    }
    async closeApp() {
        return new Promise((resolve) => {
            this.app.close(resolve)
        })
    }
    async getMainPage() {

        let res = axios.get(`${this.url}`)
        return res

    }
}
module.exports = TestSite