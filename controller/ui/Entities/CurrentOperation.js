class CurrentOperation{
    constructor(operationGroup, target, index = -1, result = null, resulMsg = ""){
        this.operationGroup = operationGroup
        this.target = target      //This needs to be a Object Locator, I'm not sure if we need to add a validation or not
        this.index = index
        this.result = result
        this.resulMsg = resulMsg
    }
}

module.exports = CurrentOperation;