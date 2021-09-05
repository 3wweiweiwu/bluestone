const { LocatorManager } = require('../../../controller/locator')
const path = require('path')
const assert = require('assert')
describe('locator.record', () => {
    it('should recurse through sample project', (done) => {
        const bluestoneLocatorPath = path.join(__dirname, '../../sample-project/bluestone-locator.js')
        let locatorManager = new LocatorManager(bluestoneLocatorPath)
        let baseline = {
            "locatorLibrary": [
                {
                    "Locator": [
                        "/html/body/ng-view/section/header/form/input"
                    ],
                    "screenshot": null,
                    "path": [
                        "todoPage",
                        "todoText"
                    ]
                },
                {
                    "Locator": [
                        "/html/body/ng-view/section/header/form/input1"
                    ],
                    "screenshot": null,
                    "path": [
                        "commonPage"
                    ]
                }
            ],
            "locatorPath": "c:\\Users\\3wwei\\bluestone\\test\\sample-project\\bluestone-locator.js"
        }
        assert.deepStrictEqual(JSON.parse(JSON.stringify(locatorManager)), baseline)
        done()
    })
})