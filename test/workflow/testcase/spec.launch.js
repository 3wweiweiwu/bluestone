const assert = require('assert')
const TestSite = require('../support/testSite.support')
let Bluestone = require('../support/bluestoneBackend')
let siteBackend = new TestSite()
let bluestoneBackend = new Bluestone()
describe('Smoke Test', () => {
    beforeEach(async () => {
        await siteBackend.launchApp()
        await bluestoneBackend.launchApp()

    })
    it('should launch test harness and bluestone correctly', async () => {
        let res = await siteBackend.getMainPage()
        assert.strictEqual(res.status, 200, 'test harness site should launched')

        res = await bluestoneBackend.getMainPage()
        assert.strictEqual(res.status, 200, 'bluestone backend should launched')


    }).timeout(5000)
    afterEach(async () => {
        await siteBackend.closeApp()
        await bluestoneBackend.closeApp()
    });
})