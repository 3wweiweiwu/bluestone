var Locator = require("../../ui/Entities/Locator") 
var OperationGroup = require("../../ui/Entities/OperationGroup") 

class CurrentOperation{
    constructor(operationGroup, target, index = -1, result = null, resulMsg = ""){
        this.operationGroup = operationGroup
        this.target = target      //This needs to be a Object Locator, I'm not sure if we need to add a validation or not
        this.index = index
        this.result = result
        this.resulMsg = resulMsg
    }

    fromJson(json) {
        if(json.index){
            this.index = json.index
        }
        if (json.operationGroup){
            this.operationGroup = new OperationGroup()
            this.operationGroup.getOperationFromCurrentOperation(json.operationGroup)
        }
        if (json.target){
            this.target = new Locator()
            this.target.fromJson(json.target)
        }
    }

    isCompleate(){
        if(this.operationGroup.id === null || this.operationGroup.id == "" || !this.operationGroup.id){
            return `Please input group info`
        }
        if(!this.operationGroup.operations || this.operationGroup.operations == null || this.operationGroup.operations.name == null || this.operationGroup.operations.name == '' ){
            return `Please input operation info`
        }
        return true
    }
}

module.exports = CurrentOperation;