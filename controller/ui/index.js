const LocatorDefiner = require('./class/LocatorDefiner')
const Operation = require('./class/Operation')
const Workflow = require('./class/Workflow')
const { WorkflowRecord } = require('../record/class')
class UI {
    /**
     * 
     * @param {WorkflowRecord} workflow 
     */
    constructor(backend) {
        this.backend = backend
        this.locatorDefiner = new LocatorDefiner('', '', '', '', [], -1)
        this.operation = new Operation(this.backend)
        this.workflow = new Workflow([])

    }
    async updateUserInputForSpy(query) {
        let queryKeys = Object.keys(query)
        //if there is no query, we will just return
        if (queryKeys.length == 0) {
            return
        }
        this.operation.update(query)
        let firstKey = queryKeys[0]
        let firstValue = query[firstKey]
        this.operation.update(query)

    }
}

module.exports = UI
