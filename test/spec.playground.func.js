
const path = require('path')
var _eval = require('eval')
const acorn = require("acorn");
const fs = require('fs')
const walk = require("acorn-walk")
const extract = require('acorn-extract-comments')
const doctrine = require("doctrine");
const escodegen = require('escodegen')

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
    it('should create script based on ast', async () => {
        let jsPath = path.join(__dirname, './sample-project/functions/logConsole.js')
        let jsStr = fs.readFileSync(jsPath).toString()
        let output = acorn.parse(jsStr)
        let astJson = {
            "type": "ExpressionStatement",
            "start": 0,
            "end": 99,
            "expression": {
                "type": "AwaitExpression",
                "start": 0,
                "end": 99,
                "argument": {
                    "type": "CallExpression",
                    "start": 6,
                    "end": 99,
                    "callee": {
                        "type": "MemberExpression",
                        "start": 6,
                        "end": 42,
                        "object": {
                            "type": "MemberExpression",
                            "start": 6,
                            "end": 37,
                            "object": {
                                "type": "Identifier",
                                "start": 6,
                                "end": 19,
                                "name": "bluestoneFunc"
                            },
                            "property": {
                                "type": "Identifier",
                                "start": 20,
                                "end": 37,
                                "name": "waitElementExists"
                            },
                            "computed": false,
                            "optional": false
                        },
                        "property": {
                            "type": "Identifier",
                            "start": 38,
                            "end": 42,
                            "name": "func"
                        },
                        "computed": false,
                        "optional": false
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "start": 43,
                            "end": 47,
                            "name": "page"
                        },
                        {
                            "type": "MemberExpression",
                            "start": 49,
                            "end": 85,
                            "object": {
                                "type": "Identifier",
                                "start": 49,
                                "end": 56,
                                "name": "locator"
                            },
                            "property": {
                                "type": "Literal",
                                "start": 57,
                                "end": 84,
                                "value": "Todo_Page/TODO_Text_Input",
                                "raw": "'Todo_Page/TODO_Text_Input'"
                            },
                            "computed": true,
                            "optional": false
                        },
                        {
                            "type": "Literal",
                            "start": 87,
                            "end": 91,
                            "value": 3000,

                        },
                        {
                            "type": "Literal",
                            "start": 92,
                            "end": 98,
                            "value": "3000",

                        }
                    ],
                    "optional": false
                }
            }
        }
        let jsCode = escodegen.generate(astJson)
        console.log(output)
    }).timeout(600000)
})