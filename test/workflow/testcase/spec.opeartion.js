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
const locator = puppeteerSupport.Locator.Operation
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
    it('should launch bluestone test environment', async function () {
        this.timeout(999999)
        let happyPathPage = testConfig.testSite.page.happypath
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500))
        await siteBackend.callBluestoneTab(happyPathPage.header)

        await new Promise(resolve => setTimeout(resolve, 999999))


    })
    it('should change selector in the backend once selector value is changed in the bluestone console', async function () {
        this.timeout(999999)
        let happyPathPage = testConfig.testSite.page.happypath
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500))
        await siteBackend.callBluestoneTab(happyPathPage.header)
        // await new Promise(resolve => setTimeout(resolve, 999999))

        const browser = await puppeteer.launch(puppeteerSupport.config);
        const page = await browser.newPage();
        await bluestoneFunc.goto.func(page, bluestoneBackend.operationUrl)
        await bluestoneFunc.waitElementExists.func(page, puppeteerSupport.Locator.Operation['First Dropdown'], 21467);
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation['First Dropdown']);
        await bluestoneFunc.waitElementExists.func(page, puppeteerSupport.Locator.Operation['Verify Button'], 3000);
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation['Verify Button']);

        await new Promise(resolve => setTimeout(resolve, 1500))
        let data = await bluestoneBackend.getBackendOperation()
        assert.deepEqual(data.data.currentSelector, '5566', 'The selector value does not change')

    })
    it('should change the first dropdown box to verify', async function () {
        this.timeout(999999)
        let happyPathPage = testConfig.testSite.page.happypath
        //test bluestone's browser recording function
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500))
        await siteBackend.callBluestoneTab(happyPathPage.header)

        //test bluestone's ctrl+q agent's GUI
        const browser = await puppeteer.launch(puppeteerSupport.config);
        const page = await browser.newPage();
        const frame = page
        await bluestoneFunc.goto.func(page, bluestoneBackend.operationUrl)
        await bluestoneFunc.waitElementExists.func(frame, locator['First Dropdown Button'], 13547);
        await bluestoneFunc.click.func(frame, locator['First Dropdown Button']);
        await bluestoneFunc.waitElementExists.func(frame, locator['Verify Button'], 3000);
        await bluestoneFunc.click.func(frame, locator['Verify Button']);
        await new Promise(resolve => setTimeout(resolve, 500))
        console.log('hello world')

        //
    })
    it('should create environment for bluestone recording', async function () {
        this.timeout(999999)
        let happyPathPage = testConfig.testSite.page.happypath
        //test bluestone's browser recording function
        await bluestoneBackend.startRecording(siteBackend.singlePageHappyPath)
        await siteBackend.sendOperation('click', happyPathPage.header)
        await siteBackend.sendOperation('change', happyPathPage.text_input_first_name, 'Wix')
        await siteBackend.sendOperation('change', happyPathPage.text_input_last_name, 'Woo')
        await siteBackend.sendOperation('click', happyPathPage.button_submit_form)
        await new Promise(resolve => setTimeout(resolve, 500))
        await siteBackend.callBluestoneTab(happyPathPage.header)
        await new Promise(resolve => setTimeout(resolve, 999999))


        //
    })
})