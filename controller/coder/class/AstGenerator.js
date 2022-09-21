class AstGenerator {
    /**
     * Create simple member expression. Sample: vars['123']
     * @param {string} identifierName vars
     * @param {string} literalName 123
     * @returns 
     */
    static getSimpleMemberExpression(identifierName, literalName) {
        return AstGenerator.getDictionaryVariableAst(identifierName, literalName)
    }
    /**
     * Create simple ast for variable. sample var1
     * @param {string} varName name of the var in this case, it will be'var1'
     * @returns 
     */
    static getSimpleVariableAst(varName) {
        return {
            "type": "Identifier",
            "name": varName
        }
    }
    /**
     * Get snapshot path. Sample:   vars.getSnapshot('Bluestone-Snapshot-1')
     * @param {string} snapshotName 
     * @returns 
     */
    static getSnapshotPathAst(snapshotName) {
        return {
            "type": "CallExpression",
            "callee": {
                "type": "MemberExpression",
                "object": {
                    "type": "Identifier",
                    "name": "vars"
                },
                "property": {
                    "type": "Identifier",
                    "name": "getSnapshot"
                },
                "computed": false,
                "optional": false
            },
            "arguments": [
                {
                    "type": "Literal",
                    "value": snapshotName,
                }
            ],
            "optional": false
        }
    }
    /**
     * Create simple ast for variable. sample (var1['key1'])
     * @param {string} varName in this case, it will be var1
     * @param {string} keyName in this case, it will be key1
     * @returns 
     */
    static getDictionaryVariableAst(varName, keyName) {
        return {
            "type": "MemberExpression",

            "object": {
                "type": "Identifier",
                "name": varName
            },
            "property": {
                "type": "Literal",
                "value": keyName,
                "raw": `'${keyName}'`
            },
            "computed": true,
            "optional": false
        }
    }
    /**
     * Create ast for value func('hello')
     * @param {string} value 'hello'
     * @returns 
     */
    static getSimpleValue(value) {
        return {
            "type": "Literal",
            "value": value,

        }
    }
    /**
     * Create variable that can be used as a elemnt selector
     * @param {string} elementVarName 
     * @param {string} locatorName 
     * @returns 
     */
    static getElementSelectorArgAst(elementVarName, locatorName) {
        return AstGenerator.getDictionaryVariableAst(elementVarName, locatorName)
    }
    /**
     * create the variable that can be used for page
     * @param {string} frameVarName 
     * @returns 
     */
    static getFrameArgAst(frameVarName) {
        return AstGenerator.getSimpleVariableAst(frameVarName)
    }
    /**
     * create the variable that can be used for var saver
     * @param {string} varSaverVarName 
     * @returns 
     */
    static getVarSaverArgAst(varSaverVarName) {
        return AstGenerator.getSimpleVariableAst(varSaverVarName)
    }
    /**
     * create the variable that can be used for page
     * @param {string} pageVarName 
     * @returns 
     */
    static getPageArgAst(pageVarName) {
        return AstGenerator.getSimpleVariableAst(pageVarName)
    }
    /**
     * Create a argument for browser
     * @param {string} browserVarName 
     * @returns 
     */
    static getBrowserArgAst(browserVarName) {
        return AstGenerator.getSimpleVariableAst(browserVarName)
    }
    /**
     * Create opeartion such as s1=await function()
     * @param {string} variableName s1
     * @param {*} operationAst ast for await function()
     * @returns 
     */
    static getAssignFunctionResultToNormalVarOperation(variableName, operationAst) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": variableName
                },
                "right": operationAst
            }
        }

    }
    /**
     * Create opeartion such as vars["s123"]=await funcName()
     * @param {string} variableStorageVarName vars
     * @param {string} variableName s123
     * @param {*} operationAst ast for await funcName()
     * @returns 
     */
    static getAssignmentFunctionResultToVarsDictOperation(variableStorageVarName, variableName, operationAst) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "object": {
                        "type": "Identifier",
                        "name": variableStorageVarName
                    },
                    "property": {
                        "type": "Literal",
                        "value": variableName,
                    },
                    "computed": true,
                    "optional": false
                },
                "right": operationAst
            }
        }
    }
    /**
     * assign variable based on other variable value s1=s2
     * @param {string} leftVarName  s1
     * @param {string} rightVarName  s2
     * @returns 
     */
    static getAssignVarToVarOpeartion(leftVarName, rightVarName) {
        return {
            "type": "ExpressionStatement",

            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": leftVarName
                },
                "right": {
                    "type": "Identifier",
                    "name": rightVarName
                }
            }
        }
    }
    /**
     * await bluestoneFunc.initialize.func(vars, page)
     * @param {string} varsName  vars
     * @param {string} pageName  page
     * @returns 
     */
    static getInitializeOperation(varsName, pageName) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AwaitExpression",
                "argument": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "object": {
                            "type": "MemberExpression",
                            "object": {
                                "type": "Identifier",
                                "name": "bluestoneFunc"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "initialize"
                            },
                            "computed": false,
                            "optional": false
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "func"
                        },
                        "computed": false,
                        "optional": false
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": varsName
                        },
                        {
                            "type": "Identifier",
                            "name": pageName
                        }
                    ],
                    "optional": false
                }
            }
        }
    }
    /**
     * Create a argument for library and method funcLib.method1.func()
     * @param {string} libraryName in this case, it is funcLib
     * @param {string} methodName in this case, it is method1
     * @returns 
     */
    static getAwaitCommandWrapper(libraryName, methodName) {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AwaitExpression",
                "argument": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "object": {
                            "type": "MemberExpression",
                            "object": {
                                "type": "Identifier",
                                "name": libraryName
                            },
                            "property": {
                                "type": "Identifier",
                                "name": methodName
                            },
                            "computed": false,
                            "optional": false
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "func"
                        },
                        "computed": false,
                        "optional": false
                    },
                    "arguments": [

                    ],
                    "optional": false
                }
            }
        }
    }
    /**
     * Sample: const variableName=require('libraryName')
     * @param {string} variableName 
     * @param {string} libraryName 
     */
    static getRequireStatement(variableName, libraryName) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": variableName
                    },
                    "init": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "Identifier",
                            "name": "require"
                        },
                        "arguments": [
                            {
                                "type": "Literal",
                                "value": libraryName,
                            }
                        ],
                        "optional": false
                    }
                }
            ],
            "kind": 'const'
        }
        return ast
    }
    /**
     * variable={}
     * @returns 
     */
    static getSingleVariableInitialization() {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": "variable"
                },
                "right": {
                    "type": "ObjectExpression",
                    "properties": []
                }
            }
        }
    }
    /**
     * let element,s1
     * @param {Array<string>} variableNameList 
     * @returns 
     */
    static getVariableDeclaration(variableNameList) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [

            ],
            "kind": "let"
        }
        variableNameList.forEach(item => {
            ast.declarations.push({
                "type": "VariableDeclarator",
                "id": {
                    "type": "Identifier",
                    "name": item
                },
                "init": null
            })
        })
        return ast
    }
    static getDescribeItWrapper(description, itShould) {
        let ast = {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "describe"
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": description,
                    },
                    {
                        "type": "ArrowFunctionExpression",
                        "id": null,
                        "expression": false,
                        "generator": false,
                        "async": false,
                        "params": [],
                        "body": {
                            "type": "BlockStatement",
                            "body": [
                                {
                                    "type": "ExpressionStatement",
                                    "expression": {
                                        "type": "CallExpression",
                                        "callee": {
                                            "type": "Identifier",
                                            "name": "it"
                                        },
                                        "arguments": [
                                            {
                                                "type": "Literal",
                                                "value": itShould,
                                            },
                                            {
                                                "type": "FunctionExpression",
                                                "id": null,
                                                "expression": false,
                                                "generator": false,
                                                "async": true,
                                                "params": [],
                                                "body": {
                                                    "type": "BlockStatement",
                                                    "body": []
                                                }
                                            }
                                        ],
                                        "optional": false
                                    }
                                }
                            ]
                        }
                    }
                ],
                "optional": false
            }
        }
        return ast
    }
    /**
     * const browser = await bluestoneFunc.launchBrowser.func(config.puppeteer)
     * @param {*} browserVarName 
     * @param {*} configVarname 
     * @param {*} puppeteerConfigPath 
     */
    static getBrowserStatementWithBluestone(browserVarName, configVarname, puppeteerConfigPath) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": browserVarName
                    },
                    "init": {
                        "type": "AwaitExpression",
                        "argument": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "object": {
                                    "type": "MemberExpression",
                                    "object": {
                                        "type": "Identifier",
                                        "name": "bluestoneFunc"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "launchBrowser"
                                    },
                                    "computed": false,
                                    "optional": false
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "func"
                                },
                                "computed": false,
                                "optional": false
                            },
                            "arguments": [
                                {
                                    "type": "MemberExpression",
                                    "object": {
                                        "type": "Identifier",
                                        "name": configVarname
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": puppeteerConfigPath
                                    },
                                    "computed": false,
                                    "optional": false
                                }
                            ],
                            "optional": false
                        }
                    }
                }
            ],
            "kind": "const"
        }
        return ast
    }
    /**
     * const browser = await puppeteer.launch(config.puppeteer)
     * @param {string} browserVarName browser
     * @param {string} puppeteerVarName puppeteer
     * @param {string} configVarname config
     * @param {string} puppeteerConfigPath puppeteer
     * @returns 
     */
    static getBrowserStatement(browserVarName, puppeteerVarName, configVarname, puppeteerConfigPath) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": browserVarName
                    },
                    "init": {
                        "type": "AwaitExpression",
                        "argument": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "object": {
                                    "type": "Identifier",
                                    "name": puppeteerVarName
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "launch"
                                },
                                "computed": false,
                                "optional": false
                            },
                            "arguments": [
                                {
                                    "type": "MemberExpression",
                                    "object": {
                                        "type": "Identifier",
                                        "name": configVarname
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": puppeteerConfigPath
                                    },
                                    "computed": false,
                                    "optional": false
                                }
                            ],
                            "optional": false
                        }
                    }
                }
            ],
            "kind": "const"
        }
        return ast
    }
    /**
     * let page = await browser.newPage();
     * @param {string} pageVarName page
     * @param {string} browserVarName browser
     * @returns 
     */
    static getPageInitializationStatement(pageVarName, browserVarName) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": pageVarName
                    },
                    "init": {
                        "type": "AwaitExpression",
                        "argument": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "object": {
                                    "type": "Identifier",
                                    "name": browserVarName
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "newPage"
                                },
                                "computed": false,
                                "optional": false
                            },
                            "arguments": [],
                            "optional": false
                        }
                    }
                }
            ],
            "kind": "let"
        }
        return ast
    }
    /**
     * const client = await page.target().createCDPSession();
     * @param {string} clientVarName client
     * @param {string} pageVarName page
     * @returns 
     */
    static getCreateCDPSession(clientVarName, pageVarName) {
        let ast = {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": clientVarName
                    },
                    "init": {
                        "type": "AwaitExpression",
                        "argument": {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "object": {
                                    "type": "CallExpression",
                                    "callee": {
                                        "type": "MemberExpression",
                                        "object": {
                                            "type": "Identifier",
                                            "name": pageVarName
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "target"
                                        },
                                        "computed": false,
                                        "optional": false
                                    },
                                    "arguments": [],
                                    "optional": false
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "createCDPSession"
                                },
                                "computed": false,
                                "optional": false
                            },
                            "arguments": [],
                            "optional": false
                        }
                    }
                }
            ],
            "kind": "const"
        }
        return ast
    }
    /**
     * await client.send('Network.clearBrowserCookies');
     * @param {string} clientVarName client
     * @param {'Network.clearBrowserCookies'|'Network.clearBrowserCache'} commandStr Network.clearBrowserCookies
     * @returns 
     */
    static getSendBDPClientCommand(clientVarName, commandStr) {
        let ast = {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AwaitExpression",
                "argument": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "object": {
                            "type": "Identifier",
                            "name": clientVarName
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "send"
                        },
                        "computed": false,
                        "optional": false
                    },
                    "arguments": [
                        {
                            "type": "Literal",
                            "value": commandStr,
                        }
                    ],
                    "optional": false
                }
            }
        }
        return ast
    }
    static getCodeWrapper() {
        return {
            "type": "Program",
            "start": 0,
            "end": 0,
            "body": [],
            "sourceType": "module"
        }
    }
    /**
     * { labelName: new className()}
     * @returns 
     */
    static getNewSimpleClassExpression(labelName, className) {
        return {
            "type": "Property",
            "method": false,
            "shorthand": false,
            "computed": false,
            "key": {
                "type": "Identifier",
                "name": labelName
            },
            "value": {
                "type": "NewExpression",
                "callee": {
                    "type": "MemberExpression",
                    "object": {
                        "type": "Identifier",
                        "name": className
                    },
                    "property": {
                        "type": "Identifier",
                        "name": className
                    },
                    "computed": false,
                    "optional": false
                },
                "arguments": []
            },
            "kind": "init"
        }
    }
    /**
     * vars = new bluestoneType.VarSaver(__filename,this.runnable().currentRetry())
     * @returns 
     */
    static getVarSaverDeclaration() {
        return {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "Identifier",
                    "name": "vars"
                },
                "right": {
                    "type": "NewExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "object": {
                            "type": "Identifier",
                            "name": "bluestoneType"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "VarSaver"
                        },
                        "computed": false,
                        "optional": false
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": "__filename"
                        },
                        {
                            "type": "CallExpression",
                            "callee": {
                                "type": "MemberExpression",
                                "object": {
                                    "type": "CallExpression",
                                    "callee": {
                                        "type": "MemberExpression",
                                        "object": {
                                            "type": "ThisExpression",
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "runnable"
                                        },
                                        "computed": false,
                                        "optional": false
                                    },
                                    "arguments": [],
                                    "optional": false
                                },
                                "property": {
                                    "type": "Identifier",
                                    "name": "currentRetry"
                                },
                                "computed": false,
                                "optional": false
                            },
                            "arguments": [],
                            "optional": false
                        }
                    ]
                }
            }
        }
    }
    /**
     * ({ page, frame } = await bluestoneFunc.switchTab.func(browser, 2));
     * @param {Array<Array<string>>} stringPair
     * @param {string} pageVarName
     * @param {} commandAst
     */
    static getDestructuringAssignment(stringPair, commandAst) {
        let statement = {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "ObjectPattern",
                    "properties": [
                    ]
                },
                "right": commandAst
            }
        }
        for (let varPair of stringPair) {
            let varPairAst = {
                "type": "Property",
                "method": false,
                "shorthand": false,
                "computed": false,
                "key": {
                    "type": "Identifier",
                    "name": varPair[0]
                },
                "kind": "init",
                "value": {
                    "type": "Identifier",
                    "name": varPair[1]
                }
            }
            statement.expression.left.properties.push(varPairAst)
        }
        return statement
    }
}
module.exports = AstGenerator