/**
 * @typedef TypeInfo
 * @property {'string'|'number'|'Browser'|'Page'|'ElementHandle'} typeName
 * @property {string} description
 * @property {string} value
 */

class TagType {
    /**
     * Enter the type name
     * @param {'Page'|'Browser'|'string'|'number'|'ElementSelector'|'Frame'|'VarSaver'|'HealingSnapshot'} typeName 
     */
    constructor(typeName) {
        this.type = 'NameExpression'
        this.name = typeName
    }
}
class JsDocTag {
    /**
     *      
     * @param {TypeInfo} typeInfo 
     * 
     */
    constructor(typeInfo) {
        this.title = 'param'
        this.description = typeInfo.description
        this.type = new TagType(typeInfo.typeName)
        this.value = null
    }
}
module.exports = JsDocTag