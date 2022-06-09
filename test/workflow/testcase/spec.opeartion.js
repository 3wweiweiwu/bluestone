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

    it('should change dropdown menu in the backend once selector value is changed in the bluestone console', async function () {
        this.timeout(999990)
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
        
        //Change operation Group using UI        
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1)
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1_Verify)
        await new Promise(resolve => setTimeout(resolve, 500))
        let userSelection = await bluestoneBackend.getUserSelection()
        assert.deepEqual(userSelection['currentGroup'], 'assert', `The current operation was not added in the UI Operation`)

        //Change operation using UI   
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.DropDnMenu2)
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1_TxtEqual)
        await new Promise(resolve => setTimeout(resolve, 500))
        userSelection = await bluestoneBackend.getUserSelection()
        assert.deepEqual(userSelection['currentOperation'], 'testTextEqual', `The current group was not added in the UI Operation`)

        //Changin Argument txt using UI
        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.argumentInput_0)
        await bluestoneFunc.change.func(page, puppeteerSupport.Locator.Operation.argumentInput_0, 'Test')
        await bluestoneFunc.keydown.func(page, 'Enter')
        await new Promise(resolve => setTimeout(resolve, 500))
        userSelection = await bluestoneBackend.getUserSelection()
        assert.deepEqual(userSelection['currentArgument'][0], 'Test', `The Argument 0 must be updated`)

        await bluestoneFunc.click.func(page, puppeteerSupport.Locator.Operation.btn_AddStep)
        
        await new Promise(resolve => setTimeout(resolve, 500))
        let step = await bluestoneBackend.getSteps()

        assert.deepEqual(step.data[step.data.length-1].command, 'testTextEqual', 'The testTextEqual step was not added')
        assert.deepEqual(step.data[step.data.length-1].functionAst.params[2].pugType, 'Test', `The Argument 0 must be added in the step`)
    })

    it('UI Operation Spy Current Group should change accourding with the selected group', async function () {
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
        //await bluestoneFunc.change.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1, 'Verify')
        
        let operationGroup = await bluestoneBackend.getOperationGroup()
        let operationLst = Object.keys(operationGroup)
        for (let i = 0; i< operationLst.length; i++)
        {
            let group = operationLst[i]
            await siteBackend.sendSpy('currentGroup',group)
            await new Promise(resolve => setTimeout(resolve, 500))
            let userSelection = await bluestoneBackend.getUserSelection()
            assert.deepEqual(userSelection['currentGroup'], group, `The current group was not added in the UI Operation`)
        }
    })

    it('UI Operation Spy Current Operation should change accourding with the selected operation', async function () {
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
        //await bluestoneFunc.change.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1, 'Verify')
        
        let operationGroup = await bluestoneBackend.getOperationGroup()
        let operationLst = Object.keys(operationGroup)

        for (let i = 0; i< operationLst.length; i++)
        {
            let group = operationLst[i]
            await siteBackend.sendSpy('currentGroup',group)
            for (let j = 0; j<operationGroup[group].operations.length; j++)
            {
                let operation = operationGroup[group].operations[j].name
                await siteBackend.sendSpy('currentOperation',operation)
                await new Promise(resolve => setTimeout(resolve, 500))
                let userSelection = await bluestoneBackend.getUserSelection()
                assert.deepEqual(userSelection['currentOperation'], operation, `The current operation was not added in the UI Operation`)
            }
        }
    })

    it('UI New options', async function () {
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
        //await bluestoneFunc.change.func(page, puppeteerSupport.Locator.Operation.DropDnMenu1, 'Verify')
        
        let operationGroup = await bluestoneBackend.getOperationGroup()
        let operationLst = Object.keys(operationGroup)


        let group = operationLst[0]
        await siteBackend.sendSpy('currentGroup',group)
        await new Promise(resolve => setTimeout(resolve, 500))


        let operation = operationGroup[group].operations[0].name
        await siteBackend.sendSpy('currentOperation',operation)
        await new Promise(resolve => setTimeout(resolve, 500))

    })
})