var Argument = require("../../ui/Entities/Argument") 

class Operation{
    constructor (name, description = null, arg = []){
        this.name = name
        this.description = description,
        this.arg = arg
    }

    getArguments(params){ //Function to get Arguments in the list of operations
        let operationArguments = params.reduce((previousValue, currentValue) => {
            let standardizedCurrentType = currentValue.type.name.toLowerCase()
            let argumentKeys = Object.keys(currentValue)
            var value = null
            if (argumentKeys.includes("value")){
                value = currentValue.value
            }
            if (standardizedCurrentType == 'string') {
                var argument = new Argument(currentValue.name, currentValue.description, 'text', value)
                previousValue.push(argument)
            }
            else if (standardizedCurrentType == 'number') {
                var argument = new Argument(currentValue.name, currentValue.description, 'number', value)
                previousValue.push(argument)
            }                                                                                                                                                                                                                                                                                                                                                                                                                              
            else {
                //console.log()
                //mark params value to be page/browser/element
            }
            return previousValue
        }, [])
        this.arg = operationArguments
    }

    getArgumentsFromCurrentOperation(json){
        Object.assign(this, json);
        if(json.Argument){
            let operationArguments = json.map((element) => {
                var argument = new Argument(element.name)
                argument.value = element.value
                return argument
            })
            this.arg = operationArguments
        }
    }
}

module.exports = Operation;