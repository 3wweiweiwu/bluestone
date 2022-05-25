const puppeteer = require('puppeteer')
const bluestoneFunc = require('../../../ptLibrary/bluestone-func')
const puppeteerSupport = require('../support/puppeteer')
const TestSite = require('../support/testSite.support')
let Bluestone = require('../support/bluestoneBackend')
let siteBackend = new TestSite()
let bluestoneBackend = new Bluestone()
let testConfig = require('../testConfig')
let fs = require('fs').promises
const fsCb = require('fs')
const path = require('path')
const assert = require('assert')
describe('Smoke Test - Operation Page', () => {
    const suite = this;
    beforeEach(async function () {
        this.timeout(60000)
        siteBackend = new TestSite()
        await siteBackend.launchApp()
        bluestoneBackend = new Bluestone()
        await bluestoneBackend.launchApp()
    })
    afterEach(function (done) {
        this.timeout(120000)
        siteBackend.closeApp()
            .then(() => {
                return bluestoneBackend.stopRecording()
            })
            .then(() => {
                return bluestoneBackend.closeApp()
            })
            .then(() => {
                done()
            })
            .catch(err => {
                console.log(err)
            })
    })
    after(function (done) {
        this.timeout(12000);

        let directory = path.join(__dirname, '../../../public/temp/componentPic')
        fsCb.readdir(directory, (err, files) => {
            if (err) throw err;
            let deleteQueue = []
            for (const file of files) {
                if (file == '.placeholder') continue

                deleteQueue.push(fs.unlink(path.join(directory, file)))
            }
            //wait until all delete is done
            Promise.all(deleteQueue)
                .then(() => {
                    done()
                })
                .catch(err => {
                    console.log(err)
                })



        });
    })

    it('should change selector in the backend once selector value is changed in the bluestone console', async function () {
        this.timeout(99999)
        let happyPathPage = testConfig.testSite.page.happypath
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500))
        await siteBackend.callBluestoneTab(happyPathPage.header)

        const browser = await puppeteer.launch(puppeteerSupport.config);
        const page = await browser.newPage();
        await bluestoneFunc.goto.func(page, bluestoneBackend.operationUrl)
        await bluestoneFunc.change.func(page, puppeteerSupport.Locator.Operation.txtSelector, '5566')
        await bluestoneFunc.keydown.func(page, 'Enter')
        await new Promise(resolve => setTimeout(resolve, 500))
        let data = await bluestoneBackend.getBackendOperation()
        assert.deepEqual(data.data.currentSelector, '5566', 'The selector value does not change')

    })
})