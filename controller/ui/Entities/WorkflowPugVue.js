class WorkflowPugVue
{
    constructor (testSuiteName = null, testName = null, result = false, message = null)
    {
        this.testSuiteName = testSuiteName
        this.testName = testName
        this.result = result
        this.message = message
    }

    fromJson(json) {
        Object.assign(this, json);
    }

    isCompleate(){
        if(this.testSuiteName === null || this.testSuiteName == ""){
            return(`Please input  Test suite`)
        }
        if(this.testName === null || this.testName == ""){
            return(`Please input  Test name`)
        }
        return true
    }

    isRunnable(){
        if(this.testSuiteName === null || this.testSuiteName == ""){
            return(`Please input  Test suite`)
        }
        if(this.testName === null || this.testName == ""){
            return(`Please input  Test name`)
        }
        if(this.result === null || this.result == false){
            return(`Please input click on revolve before run the workflow`)
        }
        return true
    }
}

module.exports = WorkflowPugVue