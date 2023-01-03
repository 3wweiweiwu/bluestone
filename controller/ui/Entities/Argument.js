class Argument {
    constructor (name, description = null,  type = null, value = null) {
        this.name = name
        this.description = description
        this.value = value
        this.type = type
    }

    fromJson(json) {
        Object.assign(this, json);
    }


}

module.exports = Argument;