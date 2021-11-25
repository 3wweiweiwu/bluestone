const assert = require('assert')
const TestSite = require('../support/testSite.support')
let Bluestone = require('../support/bluestoneBackend')
let siteBackend = new TestSite()
let bluestoneBackend = new Bluestone()
let testConfig = require('../testConfig')
describe('Smoke Test', () => {
    beforeEach(done => {
        siteBackend.launchApp()
            .then(() => {
                return bluestoneBackend.launchApp()
            }

            )
            .then(done)


    })
    it('should launch test harness and bluestone correctly', async () => {
        let res = await siteBackend.getMainPage()
        assert.strictEqual(res.status, 200, 'test harness site should launched')

        res = await bluestoneBackend.getMainPage()
        assert.strictEqual(res.status, 200, 'bluestone backend should launched')


    }).timeout(5000)
    it('should record click, change, and submit form steps correctly', async () => {
        let happyPathPage = testConfig.testSite.page.happypath
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500000))


    }).timeout(500000)
    afterEach(done => {
        siteBackend.closeApp()
            .then(() => {
                return bluestoneBackend.closeApp()
            })
            .then(done)
    })
})