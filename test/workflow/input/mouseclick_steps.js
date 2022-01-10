module.exports = [
    {
        "command": "goto",
        "target": "http://localhost:3607/site/singlePageHappyPath.html",
        "iframe": [

        ],
        "potentialMatch": [

        ],
        "framePotentialMatch": [

        ],
        "__htmlPath": null,
        "targetPicPath": null,
        "timeoutMs": null,
        "meta": {

        },
        "finalLocatorName": "FAKE locator name to avoid check",
        "finalLocator": "FAKE locator to avoid check",
        "functionAst": {
            "path": "",
            "name": "goto",
            "description": "Navigate browser to he url",
            "params": [
                {
                    "title": "param",
                    "description": null,
                    "type": {
                        "type": "NameExpression",
                        "name": "Frame"
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
                    "value": "http://localhost:3607/site/singlePageHappyPath.html"
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
        "result": {
            "isResultPass": false,
            "resultText": ""
        }
    },
    {
        "command": "waitElementExists",
        "target": "#div1",
        "iframe": [

        ],
        "potentialMatch": [

        ],
        "framePotentialMatch": [

        ],
        "__htmlPath": null,
        "targetInnerText": "This is a paragrah",
        "targetPicPath": null,
        "timeoutMs": null,
        "meta": {

        },
        "finalLocatorName": "",
        "finalLocator": [
            ""
        ],
        "functionAst": {
            "path": "",
            "name": "waitElementExists",
            "description": "element exists",
            "params": [
                {
                    "title": "param",
                    "description": null,
                    "type": {
                        "type": "NameExpression",
                        "name": "Frame"
                    },
                    "name": "frame"
                },
                {
                    "title": "param",
                    "description": "element selector object",
                    "type": {
                        "type": "NameExpression",
                        "name": "ElementSelector"
                    },
                    "name": "elementSelector"
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
        "parameter": [
            {
                "title": "param",
                "description": null,
                "type": {
                    "type": "NameExpression",
                    "name": "Frame"
                },
                "name": "frame"
            },
            {
                "title": "param",
                "description": "element selector object",
                "type": {
                    "type": "NameExpression",
                    "name": "ElementSelector"
                },
                "name": "elementSelector"
            }
        ],
        "result": {
            "isResultPass": false,
            "resultText": ""
        },
        "timeStamp": 1641790547704
    },
    {
        "command": "click",
        "target": "#div1",
        "iframe": [

        ],
        "potentialMatch": [

        ],
        "framePotentialMatch": [

        ],
        "__htmlPath": null,
        "targetInnerText": "This is a paragrah",
        "targetPicPath": null,
        "timeoutMs": null,
        "meta": {

        },
        "finalLocatorName": "",
        "finalLocator": [
            ""
        ],
        "functionAst": {
            "path": "",
            "name": "click",
            "description": "Click UI element",
            "params": [
                {
                    "title": "param",
                    "description": null,
                    "type": {
                        "type": "NameExpression",
                        "name": "Frame"
                    },
                    "name": "frame"
                },
                {
                    "title": "param",
                    "description": "element selector object",
                    "type": {
                        "type": "NameExpression",
                        "name": "ElementSelector"
                    },
                    "name": "elementSelector"
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
        "result": {
            "isResultPass": false,
            "resultText": ""
        },
        "timeStamp": 1641790547704
    },
    {
        "command": "waitElementExists",
        "target": "#header",
        "iframe": [

        ],
        "potentialMatch": [
            {
                "Locator": [
                    "#header"
                ],
                "screenshot": "componentPic/Header.png",
                "path": "Header",
                "selector": true
            }
        ],
        "framePotentialMatch": [

        ],
        "__htmlPath": null,
        "targetInnerText": "This is header",
        "targetPicPath": null,
        "timeoutMs": null,
        "meta": {

        },
        "finalLocatorName": "",
        "finalLocator": [
            ""
        ],
        "functionAst": {
            "path": "",
            "name": "waitElementExists",
            "description": "element exists",
            "params": [
                {
                    "title": "param",
                    "description": null,
                    "type": {
                        "type": "NameExpression",
                        "name": "Frame"
                    },
                    "name": "frame"
                },
                {
                    "title": "param",
                    "description": "element selector object",
                    "type": {
                        "type": "NameExpression",
                        "name": "ElementSelector"
                    },
                    "name": "elementSelector"
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
        "parameter": [
            {
                "title": "param",
                "description": null,
                "type": {
                    "type": "NameExpression",
                    "name": "Frame"
                },
                "name": "frame"
            },
            {
                "title": "param",
                "description": "element selector object",
                "type": {
                    "type": "NameExpression",
                    "name": "ElementSelector"
                },
                "name": "elementSelector"
            }
        ],
        "result": {
            "isResultPass": false,
            "resultText": ""
        },
        "timeStamp": 1641790548512
    },
    {
        "command": "click",
        "target": "#header",
        "iframe": [

        ],
        "potentialMatch": [
            {
                "Locator": [
                    "#header"
                ],
                "screenshot": "componentPic/Header.png",
                "path": "Header",
                "selector": true
            }
        ],
        "framePotentialMatch": [

        ],
        "__htmlPath": null,
        "targetInnerText": "This is header",
        "targetPicPath": null,
        "timeoutMs": null,
        "meta": {

        },
        "finalLocatorName": "",
        "finalLocator": [
            ""
        ],
        "functionAst": {
            "path": "",
            "name": "click",
            "description": "Click UI element",
            "params": [
                {
                    "title": "param",
                    "description": null,
                    "type": {
                        "type": "NameExpression",
                        "name": "Frame"
                    },
                    "name": "frame"
                },
                {
                    "title": "param",
                    "description": "element selector object",
                    "type": {
                        "type": "NameExpression",
                        "name": "ElementSelector"
                    },
                    "name": "elementSelector"
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
        "result": {
            "isResultPass": false,
            "resultText": ""
        },
        "timeStamp": 1641790548512
    }
]
