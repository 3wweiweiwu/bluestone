var Operation = require("../../ui/Entities/Operation") 

class OperationGroup{
    constructor (id, name, operations = []){
        this.id = id
        this.name = name
        this.operations = operations
    }

    getOperations(operationsData){ 
        var operations = operationsData.map( element =>{
            var operation = new Operation(element.name, element.description)
            operation.getArguments(element.params)
            return operation
        })
        this.operations = operations
    }

    getOperationFromCurrentOperation(json){
        Object.assign(this, json);
    }
}

module.exports = OperationGroup;