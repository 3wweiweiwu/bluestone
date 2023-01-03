var Argument = require("../../ui/Entities/Argument") 

class Operation{
    constructor (name, description = null, argmunets = []){
        this.name = name
        this.description = description,
        this.argmunets = argmunets
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
        this.argmunets = operationArguments
    }
}

module.exports = Operation;