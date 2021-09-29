const { LocatorManager } = require('../../../controller/locator')
const path = require('path')
const assert = require('assert')
describe('locator.record', () => {
    it('should recurse through sample project', (done) => {
        const bluestoneLocatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let locatorManager = new LocatorManager(bluestoneLocatorPath)
        locatorManager.locatorPath = ''
        let baseline = {
            "__locatorLibrary": [
                {
                    "Locator": [
                        "/html/body/ng-view/section/header/form/input"
                    ],
                    "screenshot": null,
                    "path": "Todo_Page/TODO_Text_Input",
                    "selector": false
                },
                {
                    "Locator": [
                        "/html/body/ng-view/section/header/form/input"
                    ],
                    "screenshot": null,
                    "path": "Todo_Page/todoText2",
                    "selector": false
                },
                {
                    "Locator": [
                        "/html/body/ng-view/section/header/form/input1"
                    ],
                    "screenshot": null,
                    "path": "Common_Page/locatorNotWork",
                    "selector": false
                }
            ],
            "locatorPath": "",
            "lastRefreshTime": 0
        }
        locatorManager.locatorPath = ""
        assert.deepStrictEqual(JSON.parse(JSON.stringify(locatorManager)), baseline)
        done()
    })
})