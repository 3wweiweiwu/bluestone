class WorkflowPug 
{
    constructor (testSuiteName = null, testName = null, result = null, message = null)
    {
        this.testSuiteName = testSuiteName
        this.testName = testName
        this.result = result
        this.message = message
    }

    fromJson(json) {
        Object.assign(this, json);
    }

    compleat(){
        if(this.testSuiteName != null && this.testName != null){
            return true
        }
        return false
    }
}

class Step
{
    constructor (operation, operationGroup, opArguments, locator, index = -1, result = null, resultMsg = null)
    {
        this.operation = operation
        this.operationGroup = operationGroup
        this.opArguments = opArguments
        this.locator = locator
        this.index = index
        this.result = result
        this.resultMsg = resultMsg
    }

    fromJson(json) {
        Object.assign(this, json);
    }

    compleat(){
        if (this.operation != null && this.operationGroup != null && this.opArguments != null && this.locator != null){
            return true
        }
        return false
    }
}

export {WorkflowPug, Step}