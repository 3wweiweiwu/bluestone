const axios = require('axios').default
const testConfig = require('../config')
const app = require('../../../app').app
class TestSite {
    constructor() {
        this.port = testConfig.bluestone.port
        this.url = `http://localhost:${this.port}`
        this.app = null
    }

    async launchApp() {
        return new Promise((resolve) => {
            this.app = app.listen(this.port, () => {
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