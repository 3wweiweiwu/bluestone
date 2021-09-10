
const path = require('path')
const acorn = require("acorn");
const fs = require('fs')
const walk = require('../../../../controller/ast/lib/walk');
const assert = require('assert');
const { JsDocSummary, JsDocEntry } = require('../../../../controller/ast/class/JsDocSummary')
const doctrine = require("doctrine");
const extract = require('acorn-extract-comments')
const JsDocTag = require('../../../../controller/ast/class/JsDocTag')
describe('AST walk', () => {
    it('should find the node that store logConsole function', async () => {
        let jsPath = path.join(__dirname, '../../../sample-project/bluestone-func.js')
        let jsStr = fs.readFileSync(jsPath).toString()
        let output = acorn.parse(jsStr)
        let result = walk(output, (node, ancestor) => {
            return node.type == 'Identifier' && node.name == 'logConsole'
        })
        assert.deepEqual(result.length, 1)
    })
    it('should find out all require inforamtion', async () => {
        let jsPath = path.join(__dirname, '../../../sample-project/bluestone-func.js')
        let jsStr = fs.readFileSync(jsPath).toString()
        let output = acorn.parse(jsStr)
        let result = walk(output, (node, ancestor) => {
            return (node.type == 'CallExpression') && node.callee.name == 'require' && node.arguments[0].type == 'Literal'
        })
        assert.deepEqual(result.length, 2)

        let jsFolder = path.dirname(jsPath)
        let jsDocSummary = new JsDocSummary()
        result.forEach(item => {
            let libraryName = item.ancestors[1].id.name
            let filePath = path.join(jsFolder, item.node.arguments[0].value)
            if (!filePath.toLowerCase().endsWith('.js')) {
                filePath += '.js'
            }
            let funcJs = fs.readFileSync(filePath).toString()
            const commentObj = extract(funcJs, {})
            commentObj.comments.forEach(comment => {
                let methodName = comment.after.split('=')[0].trim().replace('exports.','')
                let standardizedCommentStr = comment.value.split("\r\n").join('\n')
                let commentAST = doctrine.parse(standardizedCommentStr, { unwrap: true })
                let methodDescription = commentAST.description
                let jsDocEntry = new JsDocEntry(filePath, libraryName, methodName, methodDescription, commentAST.tags)
                jsDocSummary.add(jsDocEntry)
                console.log()
            })


        })
        console.log()

    })
})