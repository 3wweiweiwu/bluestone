class LocatorAstGen {
    /**
     * module.exports={...}
     * @returns 
     */
    static getModuleExportWrapper() {
        return {
            "type": "Program",
            "body": [
                {
                    "type": "ExpressionStatement",
                    "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                            "type": "MemberExpression",
                            "object": {
                                "type": "Identifier",
                                "name": "module"
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "exports"
                            },
                            "computed": false,
                            "optional": false
                        },
                        "right": {
                            "type": "ObjectExpression",
                            "properties": []
                        }
                    }
                }
            ],
            "sourceType": "module"
        }
    }
    /**
     *     
     * 'Todo_Page/TODO_Text_Input': {
        locator: ['/html/body/ng-view/section/header/form/input'],
        screenshot: './componentPic/1632928449951.png'
        },
     * @param {string} locatorPath Todo_Page/TODO_Text_Input
     * @param {string} locatorValue /html/body/ng-view/section/header/form/input
     * @param {string} picPath ./componentPic/1632928449951.png
     * @param {string} snapshot [...]
     * @param {string} cleanedLocatorSnapshotName TODO_PAGE_TODO_TEXT_INPUT
     * @returns 
     */
    static getLocatorStructure(locatorPath, locatorValue, picPath, snapshot, cleanedLocatorSnapshotName) {
        let locator = {
            "type": "Property",
            "method": false,
            "shorthand": false,
            "computed": false,
            "key": {
                "type": "Literal",
                "value": locatorPath,
            },
            "value": {
                "type": "ObjectExpression",
                "properties": [
                    {
                        "type": "Property",
                        "method": false,
                        "shorthand": false,
                        "computed": false,
                        "key": {
                            "type": "Identifier",
                            "name": "locator"
                        },
                        "value": {
                            "type": "ArrayExpression",
                            "elements": [
                                {
                                    "type": "Literal",
                                    "value": locatorValue,
                                }
                            ]
                        },
                        "kind": "init"
                    },
                    {
                        "type": "Property",
                        "method": false,
                        "shorthand": false,
                        "computed": false,
                        "key": {
                            "type": "Identifier",
                            "name": "screenshot"
                        },
                        "value": {
                            "type": "Literal",
                            "value": picPath || '',
                        },
                        "kind": "init"
                    },
                    {
                        "type": "Property",
                        "method": false,
                        "shorthand": false,
                        "computed": false,
                        "key": {
                            "type": "Identifier",
                            "name": "displayName"
                        },
                        "value": {
                            "type": "Literal",
                            "value": locatorPath,
                        },
                        "kind": "init"
                    }
                ]
            },
            "kind": "init"
        }
        let snapshotInfo = {
            "type": "Property",
            "method": false,
            "shorthand": false,
            "computed": false,
            "key": {
                "type": "Identifier",
                "name": "snapshot"
            },
            "value": {
                "type": "CallExpression",
                "callee": {
                    "type": "Identifier",
                    "name": "require"
                },
                "arguments": [
                    {
                        "type": "Literal",
                        "value": `./locator/${cleanedLocatorSnapshotName}.json`,
                    }
                ],
                "optional": false
            },
            "kind": "init"
        }
        if (snapshot != null) {
            locator.value.properties.push(snapshotInfo)
        }
        return locator
    }
}

module.exports = LocatorAstGen