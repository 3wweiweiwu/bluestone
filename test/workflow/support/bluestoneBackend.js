const axios = require('axios').default
const testConfig = require('../testConfig')
class TestSite {
    constructor() {
        this.port = testConfig.bluestone.port
        this.url = `http://localhost:${this.port}`
        this.app = null
        process.env.port = this.port
        this.operationUrl = `${this.url}/spy`
    }

    async launchApp() {
        return new Promise((resolve) => {
            try {
                delete require.cache[require.resolve('../../../app')];
                const app = require('../../../app').app
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
            this.app.close()
            resolve()
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
    async stopRecording() {
        let res = await axios.delete(`${this.url}/api/record`)
        return res
    }
    async getSteps() {
        let res = await axios.get(`${this.url}/diagnostics/steps`)
        let currentData = JSON.parse(res.data)
        for (let i = 0; i < currentData.length; i++) {
            if (currentData[i].functionAst.params) {
                currentData[i].functionAst.params = currentData[i].functionAst.params.filter(item => {
                    return item.name != 'timeout'
                })
            }
            if (currentData[i].parameter) {
                currentData[i].parameter = currentData[i].parameter.filter(item => {
                    return item.name != 'timeout' && item.name != 'healingSnapshot'
                })
            }
            Object.assign(currentData[i].functionAst, {
                path: ''
            })
            Object.assign(currentData[i], {
                targetPicPath: null,
                timeoutMs: null,
                __htmlPath: null
            })
        }
        currentData.forEach(step => {
            step.potentialMatch.forEach(match => {
                match.selector = null
            })
        })
        res.data = currentData
        return res
    }
    async getPageCount() {
        let res = await axios.get(`${this.url}/diagnostics/page-count`)
        return res
    }
    async getBackendOperation() {
        try {
            let res = await axios.get(`${this.url}/diagnostics/backend-operation`)
            let currentData = res.data
            Object.assign(currentData, {
                selectorPicture: "",
                selectorHtmlPath: [],
                x: null,
                y: null,
                width: null,
                height: null,
                lastOperationTime: null,
                lastOperationTimeoutMs: null,
                currentOpeartion: null,
            })
            //remove isSelector Attribute because this feature has been obsolete
            currentData.potentialMatch.forEach(item => {
                item.selector = null
            })
            res.data = currentData
            return res
        } catch (error) {
            console.log(error)
        }

    }
}
module.exports = TestSite