const walk = require('./walk')
const acorn = require('acorn')
const extract = require('extract-comments')
class BlockComment {
    constructor(methodName, commentStr, functionSignature) {
        this.type = 'BlockComment'
        this.code = {
            context: {
                receiver: 'exports',
                name: methodName
            },
            value: functionSignature
        }
        this.value = commentStr
    }
}
async function extractCommentForCustomziedFunctionClass(jsStr) {
    let finalResult = []
    let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
    let resultEntries = walk(ast, (node, ancestor) => {
        return node.type == 'MethodDefinition' && node.key.name == 'func' && ancestor.length >= 4
    }, (node, ancestors) => {
        try {
            if (ancestors[0].type != 'ExpressionStatement') return true
            if (ancestors[1].type != 'AssignmentExpression') return true
            if (ancestors[2].type != 'ClassExpression') return true
            if (ancestors[3].type != 'ClassBody') return true
            if (ancestors.length > 6) return true
        } catch (error) {

        }
        return false
    })
    for (const result of resultEntries) {
        let ancestorLength = result.ancestors.length
        let methodName = result.ancestors[ancestorLength - 4].left.property.name
        let node = result.node
        let parentNode = result.ancestors[ancestorLength - 2]
        let funcNodeIndex = parentNode.body.findIndex(item => item.start == node.start)
        let commentStr = ''
        if (funcNodeIndex > 0) {
            commentStr = jsStr.substring(parentNode.body[funcNodeIndex - 1].end, parentNode.body[funcNodeIndex].start)
        }
        else {
            commentStr = jsStr.substring(parentNode.start, result.node.start).replace("{", '')
        }
        commentStr = extract(commentStr, {})[0].value
        let paramList = result.node.value.params.map(item => item.name)
        let functionSignature = `func(${paramList.join(',')})`
        let blockComment = new BlockComment(methodName, commentStr, functionSignature)
        finalResult.push(blockComment)
    }
    return finalResult
}

module.exports = extractCommentForCustomziedFunctionClass