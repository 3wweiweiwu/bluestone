//Add soe validations in the constructor, maybe we can usome something la what we use in the customized funcions
//But most of the are list so hay havce to validate all the elements in the list

import {Locator} from "./LocatorDefiner.js"

class Argument {
    constructor (name, value = null) {
        this.name = name
        this.value = value
    }

    fromJson(json) {
        Object.assign(this, json);
    }
}

class Operation{
    constructor (name, description = null, arg = []){
        this.name = name
        this.description = description,
        this.arg = arg
    }
}

class OperationGroup{
    constructor (name, operations = []){
        this.name = name
        this.operations = operations
    }
}


class CurrentOperation{
    constructor(operationGroup, operation, locator, arg = [], index = -1, result = null, resulMsg = ""){
        this.operationGroup = operationGroup
        this. operation = operation
        this.locator = locator      //This needs to be a Object Locator, I'm not sure if we need to add a validation or not
        this. arg = arg
        this.index = index
        this.result = result
        this.resulMsg = resulMsg
    }

    fromJson(json) {
        Object.assign(this, json);
        if (json.target){
            this.target = new Locator()
            this.target.fromJson(json.target)
        }
        if (json.arg){
            this.arg = []
            json.arg.forEach(element => {
                var argument = new Argument()
                argument.fromJson(element)
                this.arg.push(argument)
            });
        }
    }

    compleat(){
        if(this.operation != null && this.target != null && this.arg.length > 0){
            return true
        }
        return false
    }
}


class OperationStatus{
    constructor(name, capturated = false, href = null){
        this.name = name
        this.capturated = capturated
        this.href = href
    }
}


export {Argument, Operation, OperationGroup, CurrentOperation, OperationStatus}