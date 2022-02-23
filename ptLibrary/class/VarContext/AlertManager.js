let os = require('os')
let path = require('path')
const assert = require('assert')
class AlertManager {
    constructor() {
        this.alertQueue = []
        this.lastAlert = ''
    }
    addAlert(message) {
        this.alertQueue.push(message)
        this.lastAlert = message
    }

    async waitAlertComplete(timeout) {
        let completeStatus = false
        let startTime = Date.now()
        //wait for 1.5s with the hope that download should start by then
        await new Promise(resolve => setTimeout(resolve, 1500))
        let elapsedTime
        do {
            elapsedTime = Date.now() - startTime
            //if item completed within wait period, we are all good
            if (this.alertQueue.length > 0) {
                this.alertQueue = []
                completeStatus = true
                break
            }
            await new Promise(resolve => setTimeout(resolve, 500))
        }
        while (elapsedTime < timeout)

        if (completeStatus) {
            return true
        }
        else {
            assert.fail(`Unable to get dialogbox within ${timeout}ms`)
        }
    }
}
module.exports = AlertManager