
const path = require('path')
var _eval = require('eval')
const acorn = require("acorn");
const fs = require('fs')
const walk = require("acorn-walk")
const extract = require('acorn-extract-comments')
const doctrine = require("doctrine");

const s1 = async function (input1) {
    console.log(input1)
    return input1
}
describe('dynamic function evaluation', () => {
    it('run function in the fly', (done) => {


        var res = _eval(`
            s1('hello').then(item=>{module.exports=item})
        `, 'dummy.js', { s1 }, false)

        console.log(res)
    }).timeout(60000)
})

describe('customized function loader', () => {
    it('should load function from bluestone-func.js', done => {
        let jsPath = path.join(__dirname, './sample-project/bluestone-func.js')
        let jsStr = fs.readFileSync(jsPath).toString()
        let output = acorn.parse(jsStr)
        walk.simple(output, {
            Literal(node) {
                // console.log(`Found a literal: ${node.value}`)
            }
        })
        walk.ancestor(output, {
            Identifier(_, ancestors) {
                if (_.name == 'func') {
                    // console.log("This literal's ancestors are:", ancestors.map(n => n.type))
                }

            }
        })
        walk.ancestor(output, {
            Identifier(_, ancestors) {
                if (_.name == 'logConsole') {
                    console.log("This literal's ancestors are:", ancestors.map(n => n.type))
                }

            }
        })
        walk.ancestor(output, {
            Identifier(_, ancestors) {
                if (_.name == 'func') {
                    // console.log("This literal's ancestors are:", ancestors.map(n => n.type))
                }

            }
        })
        walk.ancestor(output, {
            Literal(_, ancestors) {
                // console.log("This literal's ancestors are:", ancestors.map(n => n.type))
            }
        })
        console.log('----------------------')
        walk.fullAncestor(output, (node, ancestor) => {
            // console.log(node.name)
            //find out the function declaration


        })
        console.log()
    }).timeout(60000)
    it('should extract comment from supporting function', () => {
        let jsPath = path.join(__dirname, './sample-project/functions/logConsole.js')
        const str = fs.readFileSync(jsPath, 'utf8')
        const comments = extract(str, {})
        console.log('hello')
        //it seems that this library will extract jsdoc that is associated with function. It won't worry about inline jsdoc by default
        let jsdoc = comments.comments[0].value.split("\r\n").join('\n')
        let jsdocAST = doctrine.parse(jsdoc, { unwrap: true })
        console.log()
    }).timeout(600000)
})