
const path = require('path')
const escodegen = require('escodegen')
const assert = require('assert')
const Coder = require('../../../controller/coder/class/Testcase')
const fs = require('fs').promises
describe('Coder', () => {
    it('should generate code as expected', async () => {
        let functionList = [
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "goto",
                "description": "Navigate browser to he url",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "url",
                        "value": "https://todomvc.com/examples/angularjs/#/"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "waitElementExists",
                "description": "Wait element exists",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "Todo_Page/TODO_Text_Input"
                    },
                    {
                        "title": "param",
                        "description": "wait time in ms. If no element appear within this period, an error will be thrown",
                        "type": {
                            "type": "NameExpression",
                            "name": "number"
                        },
                        "name": "timeout",
                        "value": 12997
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "click",
                "description": "Click UI element",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "Todo_Page/TODO_Text_Input"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "waitElementExists",
                "description": "Wait element exists",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "Todo_Page/TODO_Text_Input"
                    },
                    {
                        "title": "param",
                        "description": "wait time in ms. If no element appear within this period, an error will be thrown",
                        "type": {
                            "type": "NameExpression",
                            "name": "number"
                        },
                        "name": "timeout",
                        "value": 2271
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "keydown",
                "description": "Press a key",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "button you want to press. Supported Button: Enter|Tab|Escape",
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "key",
                        "value": "Enter"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "waitElementExists",
                "description": "Wait element exists",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "Todo_Page/TODO_Text_Input"
                    },
                    {
                        "title": "param",
                        "description": "wait time in ms. If no element appear within this period, an error will be thrown",
                        "type": {
                            "type": "NameExpression",
                            "name": "number"
                        },
                        "name": "timeout",
                        "value": 2415
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "change",
                "description": "change value in text input",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "Todo_Page/TODO_Text_Input"
                    },
                    {
                        "title": "param",
                        "description": "Text value you want to change to",
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "text",
                        "value": "hello world!"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "waitElementExists",
                "description": "Wait element exists",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "element selector object",
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "txtTodoItem"
                    },
                    {
                        "title": "param",
                        "description": "wait time in ms. If no element appear within this period, an error will be thrown",
                        "type": {
                            "type": "NameExpression",
                            "name": "number"
                        },
                        "name": "timeout",
                        "value": 158
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\ptLibrary\\bluestone-func.js",
                "name": "testTextEqual",
                "description": "Test current text equal to desired value",
                "params": [
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": null,
                        "type": {
                            "type": "NameExpression",
                            "name": "ElementSelector"
                        },
                        "name": "elementSelector",
                        "value": "txtTodoItem"
                    },
                    {
                        "title": "param",
                        "description": "The desired text value",
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "desiredText",
                        "pugType": "text",
                        "value": "hello world!"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "invalid_locator"
                        ]
                    }
                ]
            },
            {
                "path": "c:\\Users\\wuwei\\bluestone\\test\\sample-project\\bluestone-func.js",
                "name": "logConsole",
                "description": "Log Result",
                "params": [
                    {
                        "title": "param",
                        "description": "puppeteer page object",
                        "type": {
                            "type": "NameExpression",
                            "name": "Browser"
                        },
                        "name": "browser"
                    },
                    {
                        "title": "param",
                        "description": "puppeteer page object",
                        "type": {
                            "type": "NameExpression",
                            "name": "Page"
                        },
                        "name": "page"
                    },
                    {
                        "title": "param",
                        "description": "the text info 1",
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "text1",
                        "pugType": "text",
                        "value": "test1"
                    },
                    {
                        "title": "param",
                        "description": "the text info 2",
                        "type": {
                            "type": "NameExpression",
                            "name": "string"
                        },
                        "name": "text2",
                        "pugType": "text",
                        "value": "test2"
                    }
                ],
                "locators": [
                    {
                        "locator": [
                            "/html/body/ng-view/section/header/form/input"
                        ],
                        "screenshot": "./componentPic/1632928449951.png"
                    },
                    {
                        "locator": [
                            "//body/ng-view/section/header/form/input"
                        ],
                        "screenshot": null
                    }
                ]
            }
        ]
        let bluestoneFuncPath = path.join(__dirname, '../../../ptLibrary/bluestone-func.js')
        let projectFuncPath = path.join(__dirname, '../../sample-project/bluestone-func.js')
        let projectLocatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let configPath = path.join(__dirname, '../../sample-project/config.js')
        let testFileFolder = path.join(__dirname, '.')
        let coder = new Coder(functionList, projectLocatorPath, projectFuncPath, configPath, testFileFolder, bluestoneFuncPath)
        coder.testCase = 'test test name'
        coder.testSuite = 'test suite name'
        let finalAst = await coder.__generateFinalAst()
        let finalScript = escodegen.generate(finalAst)
        let baselinePath = path.join(__dirname, './baseline/happypath.base')
        let baselineText = await fs.readFile(baselinePath)
        let baseline = JSON.parse(baselineText)
        assert.equal(finalScript, baseline.result)


    }).timeout(20000)
})