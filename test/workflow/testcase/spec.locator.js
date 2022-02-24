const assert = require('assert')
const TestSite = require('../support/testSite.support')
let siteBackend = new TestSite()
let fs = require('fs').promises
const fsCb = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
describe('Smoke Test - Locator', () => {
    const suite = this;
    /**@type {puppeteer.Browser} */
    let browser
    /**@type {puppeteer.Page} */
    let page
    let result
    /**@type {puppeteer.ElementHandle} */
    let targetElement
    /**@type {TestSite} */
    beforeEach(async function () {
        this.timeout(60000)
        siteBackend = new TestSite()
        await siteBackend.launchApp()
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 15,
            devtools: false,
        })
        page = await browser.newPage()
        await page.setDefaultTimeout(10000)
        await page.setDefaultNavigationTimeout(20000)
        //load and inject script library to web page
        let libraryPath = path.join(__dirname, '../../../public/javascript/robustLocatorGen.js')
        let libraryText = (await fs.readFile(libraryPath)).toString()
        libraryText = libraryText.replace('export function', 'function')
        await page.evaluateOnNewDocument(libraryText)
    })
    afterEach(function (done) {
        browser.close()
            .then(() => {
                return siteBackend.closeApp()
            })
            .then(() => {
                done()
            })
            .catch((err) => {
                assert.fail([err])
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
    it('should identify element that can be identified by one attribute from user priority list', async () => {
        await page.goto(siteBackend.locator_test_page_1)
        targetElement = await page.$('.childIsWithUniqueAttribute')
        const userPriority = ["class", "id"]
        let locatorResult = await targetElement.evaluate((node, userPriority) => {
            return window.findRobustLocatorForSelector(node, userPriority)
        }, userPriority)

        let baseline = require('./baseline/identify-from-user-priority')
        assert.deepStrictEqual(baseline, locatorResult)

        console.log()
    }).timeout(60000)
    it('should identify element that cannot be identified by anything provided by user', async () => {
        await page.goto(siteBackend.locator_test_page_1)
        targetElement = await page.$('body > div > div:nth-child(2) > div > div > div:nth-child(2)')
        const userPriority = ["class", "id"]
        let locatorResult = await targetElement.evaluate((node, userPriority) => {
            return window.findRobustLocatorForSelector(node, userPriority)
        }, userPriority)

        let baseline = require('./baseline/cannot-identified-by-user-priority')
        assert.deepStrictEqual(baseline, locatorResult)

        console.log()
    }).timeout(60000)
})