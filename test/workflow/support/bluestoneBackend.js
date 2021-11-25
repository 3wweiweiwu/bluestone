const axios = require('axios').default
const testConfig = require('../testConfig')
const app = require('../../../app').app
class TestSite {
    constructor() {
        this.port = testConfig.bluestone.port
        this.url = `http://localhost:${this.port}`
        this.app = null
        process.env.port = this.port
    }

    async launchApp() {
        return new Promise((resolve) => {
            try {
                this.app = app.listen(this.port, () => {
                    axios.get(`${this.url}/spy`)
                    resolve()
                })
            } catch (error) {
                console.log(error)
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
    async startRecording(url) {
        let res = await axios.post(`${this.url}/api/record`, { url: url })
        await new Promise(resolve => setTimeout(resolve, 1000))
        return res
    }
}
module.exports = TestSite