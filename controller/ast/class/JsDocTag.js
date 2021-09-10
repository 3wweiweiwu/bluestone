class TagType {
    constructor() {
        this.type = ''
        this.name = ''
    }
}
class JsDocTag {
    /**
     * 
     * @param {string} title 
     * @param {string} description 
     * @param {TagType} typeName 
     */
    constructor(title, description, typeName) {
        this.title = title
        this.description = description
        this.typeName = typeName
    }
}
module.exports = JsDocTag