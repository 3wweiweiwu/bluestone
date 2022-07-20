// const puppeteer = require('puppeteer-core')

// const fs = require('fs').promises
// const singlefileScript = require('single-file/cli/back-ends/common/scripts')
// const path = require('path')



// describe('POC', () => {
//     it("should launch puptter and take a web snapshot of current web page", async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();

//         //inject single file library into browser
//         const injectedScript = await singlefileScript.get(option);
//         await page.evaluateOnNewDocument(injectedScript)

//         await page.setBypassCSP(true)
//         await page.goto('https://github.com/puppeteer/puppeteer/blob/main/docs/api.md#puppeteer-vs-puppeteer-core');

//         const DEFAULT_OPTIONS = {
//             removeHiddenElements: false,
//             removeUnusedStyles: false,
//             removeUnusedFonts: false,
//             removeFrames: false,
//             removeImports: false,
//             removeScripts: false,
//             compressHTML: false,
//             compressCSS: false,
//             loadDeferredImages: false,
//             loadDeferredImagesMaxIdleTime: 100,
//             loadDeferredImagesBlockCookies: false,
//             loadDeferredImagesBlockStorage: false,
//             loadDeferredImagesKeepZoomLevel: false,
//             filenameTemplate: "{page-title} ({date-locale} {time-locale}).html",
//             infobarTemplate: "",
//             includeInfobar: false,
//             filenameMaxLength: 192,
//             filenameReplacedCharacters: ["~", "+", "\\\\", "?", "%", "*", ":", "|", "\"", "<", ">", "\x00-\x1f", "\x7F"],
//             filenameReplacementCharacter: "_",
//             maxResourceSizeEnabled: false,
//             maxResourceSize: 10,
//             removeAudioSrc: false,
//             removeVideoSrc: false,
//             backgroundSave: true,
//             removeAlternativeFonts: false,
//             removeAlternativeMedias: false,
//             removeAlternativeImages: false,
//             groupDuplicateImages: true,
//             saveRawPage: false,
//             resolveFragmentIdentifierURLs: false,
//             userScriptEnabled: false,
//             saveFavicon: true,
//             includeBOM: false,
//             insertMetaCSP: false,
//             insertMetaNoIndex: false,
//             insertSingleFileComment: false
//         };
//         //take a snapshot of current page
//         let pageData = await page.evaluate(async (DEFAULT_OPTIONS) => {

//             const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
//             return pageData;
//         }, [DEFAULT_OPTIONS]);

//         await fs.writeFile('./s2.html', pageData.content)
//         await browser.close();
//     })
//     it('should place icon in the middle of the screen all the time - still pending. still need a way to uniquely place icon or we should control icon in other panel ', async () => {

//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();




//         await page.evaluateOnNewDocument(() => {
//             setTimeout(() => {
//                 let existing = document.getElementsByName('helloworld')
//                 if (existing.length == 0) {
//                     let btn = document.createElement("button");
//                     btn.name = 'helloworld'
//                     btn.innerHTML = "Save";
//                     btn.addEventListener("click", function () {
//                         alert("Button is clicked");
//                     });
//                     btn.style.position = 'fixed'
//                     btn.style.top = '80%'
//                     let left = Math.floor(Math.random(10) * 100)
//                     btn.style.left = `50%`

//                     document.body.appendChild(btn);
//                 }


//             }, 500)


//         });

//         await page.goto('https://www.walmart.com/blocked?url=L20vc2hvcC1hbGwtYmFjay10by1zY2hvb2w/X2JlX3NoZWxmX2lkPTcyOTYxODImY2F0X2lkPTAmZmFjZXQ9c2hlbGZfaWQlM0E3Mjk2MTgyJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FDbGVhcmFuY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJlZHVjZWQrUHJpY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJvbGxiYWNrJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FTcGVjaWFsK0J1eSZwcz02MA==&uuid=25bf3b90-fc8d-11eb-9539-636bc3131218&vid=24a00ff1-fc8d-11eb-bd2a-4f755b4ec043&g=b');
//         console.log()

//         await browser.close()


//     }).timeout(50000000)
//     it('should test available locators and print out its location and range', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();

//         // await page.goto('https://www.walmart.com/blocked?url=L20vc2hvcC1hbGwtYmFjay10by1zY2hvb2w/X2JlX3NoZWxmX2lkPTcyOTYxODImY2F0X2lkPTAmZmFjZXQ9c2hlbGZfaWQlM0E3Mjk2MTgyJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FDbGVhcmFuY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJlZHVjZWQrUHJpY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJvbGxiYWNrJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FTcGVjaWFsK0J1eSZwcz02MA==&uuid=25bf3b90-fc8d-11eb-9539-636bc3131218&vid=24a00ff1-fc8d-11eb-bd2a-4f755b4ec043&g=b');
//         await page.goto('https://todomvc.com/examples/angularjs/#/');
//         let s1 = await page.$('body > ng-view > section > header > form > input')
//         try {
//             await s1.click()

//         } catch (error) {
//             console.log()
//         }

//         let startTime = Date.now()
//         let locators = ['body > ng-view > section > header > form > input', 'body > ng-view > section > header > form > input1']
//         let currentValue = 0
//         async function doSomething() {
//             let totalAvailableLocators = await locators.forEach(async (currentLocator) => {
//                 let element = await page.$(currentLocator)
//                 if (element != null) {
//                     let position = await element.boundingBox()
//                     if (position) console.log(`${currentLocator}:${JSON.stringify(position)}`)
//                 }

//             })

//         }

//         setInterval(doSomething, 500); // Time in milliseconds


//         await page.waitForFunction(() => {
//             return false
//         });

//         await browser.close()


//     }).timeout(50000000)
//     it("should compare the difference in between 3 evaluation approaches", async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();

//         // await page.goto('https://www.walmart.com/blocked?url=L20vc2hvcC1hbGwtYmFjay10by1zY2hvb2w/X2JlX3NoZWxmX2lkPTcyOTYxODImY2F0X2lkPTAmZmFjZXQ9c2hlbGZfaWQlM0E3Mjk2MTgyJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FDbGVhcmFuY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJlZHVjZWQrUHJpY2UlN0MlN0NzcGVjaWFsX29mZmVycyUzQVJvbGxiYWNrJTdDJTdDc3BlY2lhbF9vZmZlcnMlM0FTcGVjaWFsK0J1eSZwcz02MA==&uuid=25bf3b90-fc8d-11eb-9539-636bc3131218&vid=24a00ff1-fc8d-11eb-bd2a-4f755b4ec043&g=b');
//         await page.goto('https://todomvc.com/examples/angularjs/#/');

//         //use puppeteer to get xpath
//         let startTime = Date.now()
//         for (let i = 0; i < 0; i++) {
//             let s1 = await page.evaluate(() => {
//                 let i = 0
//                 let result = []
//                 document.evaluate('/html/body/ng-view/section/header/form/input', document).iterateNext()
//                 return result
//             })
//         }
//         let endTime = Date.now()
//         console.log(`puppeteer evaluation time:${endTime - startTime}`)
//         //use browser to render xpath
//         startTime = Date.now()
//         let objec = { hello: 5 }
//         let log = function (s1) {
//             return function () {
//                 s1.hello = s1.hello + 1
//             }
//         }
//         await page.exposeFunction('logFunc', log(objec))
//         await page.evaluate(() => {
//             for (let i = 0; i < 2000; i++) {
//                 document.evaluate('/html/body/ng-view/section/header/form/input', document).iterateNext()
//                 window.logFunc()
//             }
//         })
//         endTime = Date.now()
//         console.log(`puppeteer evaluation time:${endTime - startTime}`)
//         //use puppeteer.$x()
//         startTime = Date.now()

//         for (let i = 0; i < 0; i++) {
//             await page.$x('/html/body/ng-view/section/header/form/input')
//         }

//         endTime = Date.now()
//         console.log(`puppeteer.$x evaluation time:${endTime - startTime}`)

//         await page.waitForFunction(() => {
//             return false
//         });
//         //take xml from browser and evaluate that by ourselves

//     }).timeout(6000000)
//     it('should return locator of the elemnent that I click', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }


//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();

//         //inject finder library

//         let eventRecorderPath = path.join(__dirname, './help/eventRecorder.js')
//         let eventRecorderScript = (await fs.readFile(eventRecorderPath)).toString()




//         //register click event

//         let registerEvent = async function (eventRecorderScript) {
//             setTimeout(() => {
//                 let finderScript = document.createElement("script");
//                 finderScript.setAttribute('type', 'module')
//                 finderScript.innerHTML = eventRecorderScript
//                 document.body.appendChild(finderScript);
//                 // console.log(eventRecorderScript)

//             }, 300)

//         }
//         await page.evaluateOnNewDocument(registerEvent, eventRecorderScript)
//         let eventDetails = []
//         let logEvent = function (eventDetail) {
//             eventDetails.push(eventDetail)
//             console.log(JSON.stringify(eventDetails))
//         }
//         await page.exposeFunction('logEvent', logEvent)


//         //go to web page...
//         await page.goto('https://todomvc.com/examples/angularjs/#/');
//         await page.waitForFunction(() => {
//             return false
//         });
//     }).timeout(50000000)

//     it('should create rectangle when I mouse hover over an element', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }


//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();

//         let previousSelectors = []


//         let eerPath = path.join(__dirname, './help/elementRegionDrawer.js')
//         let elementRegionDrawerScript = (await fs.readFile(elementRegionDrawerPath)).toString()

//         let drawBorderOverElement = async function (selector) {
//             //modify preivous element
//             for (let i = 0; previousSelectors.length; i++) {
//                 let previousSelector = previousSelectors[i]
//                 if (selector != null) {
//                     let previousElement = await page.$(previousSelector)
//                     if (previousElement != null) {
//                         await previousElement.evaluate((el) => {
//                             let previousAttribute = el.getAttribute('previousBorder')

//                             el.style.border = previousAttribute
//                             el.removeAttribute('previousBorder')

//                         });
//                     }
//                     previousSelectors.shift()

//                 }
//             }


//             //modify current
//             previousSelectors.push(selector)

//             let currentElement = await page.$(selector)
//             await currentElement.evaluate((el) => {
//                 el.setAttribute('previousBorder', el.style.border)
//                 el.style.border = "3px solid #FF0000"

//             });
//         }

//         page.exposeFunction('drawBorderOverElement', drawBorderOverElement)

//         //register click event

//         let registerEvent = async function (elementRegionDrawerScript) {
//             setTimeout(() => {
//                 let finderScript = document.createElement("script");
//                 finderScript.setAttribute('type', 'module')
//                 finderScript.innerHTML = elementRegionDrawerScript
//                 document.body.appendChild(finderScript);


//             }, 300)

//         }
//         await page.evaluateOnNewDocument(registerEvent, elementRegionDrawerScript)
//         let eventDetails = []
//         let logEvent = function (eventDetail) {
//             eventDetails.push(eventDetail)
//             console.log(JSON.stringify(eventDetail))
//         }
//         await page.exposeFunction('logEvent', logEvent)


//         //go to web page...
//         await page.goto('https://todomvc.com/examples/angularjs/#/');
//         await page.waitForFunction(() => {
//             return false
//         });


//     }).timeout(50000000)
//     it("should correlate element with closet element", async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();


//         let eventHistory = [] //the event we captured
//         let activeLocatorElements = [] //current active element in the screen

//         //capture the element we click
//         let eventRecorderPath = path.join(__dirname, './help/eventRecorder.js')
//         let eventRecorderScript = (await fs.readFile(eventRecorderPath)).toString()
//         let registerEvent = async function (eventRecorderScript) {
//             setTimeout(() => {
//                 let finderScript = document.createElement("script");
//                 finderScript.setAttribute('type', 'module')
//                 finderScript.innerHTML = eventRecorderScript
//                 document.body.appendChild(finderScript);

//             }, 300)

//         }
//         await page.evaluateOnNewDocument(registerEvent, eventRecorderScript)



//         let logEvent = function (eventDetail) {

//             console.log(JSON.stringify(eventHistory))
//             let closetLocator = findClosestLocator(activeLocatorElements, eventDetail)
//             if (closetLocator == null) {
//                 eventHistory.push(eventDetail)
//             }
//             else {
//                 eventHistory.push(closetLocator)
//             }
//             console.log(JSON.stringify(eventHistory))

//         }
//         await page.exposeFunction('logEvent', logEvent)



//         await page.goto('https://todomvc.com/examples/angularjs/#/');


//         //keep searching the web page
//         let locators = [
//             '/html/body/ng-view/section/header/form/input', 'body > ng-view > section > header > form > input1',
//             'body > ng-view > section > header > form > input2', 'body > ng-view > section > header > form > input3'
//         ]

//         async function findActiveElements() {

//             let currentScan = []
//             for (let locatorIndex = 0; locatorIndex < locators.length; locatorIndex++) {
//                 try {
//                     let currentLocator = locators[locatorIndex]
//                     let element = null
//                     let position
//                     if (currentLocator.startsWith('/')) {
//                         let elements = await page.$x(currentLocator)
//                         if (elements.length == 1) {
//                             element = elements[0]
//                         }

//                     }
//                     else {
//                         element = await page.$(currentLocator)
//                     }

//                     if (element != null) {
//                         let position = await element.boundingBox()
//                         currentScan.push({ selector: currentLocator, position })
//                     }
//                 } catch (error) {

//                 }

//             }

//             activeLocatorElements = currentScan
//             setTimeout(findActiveElements, 50)


//         }

//         function findClosestLocator(activeLocatorElements = [], currentEventLocator) {
//             let closestElementSelector = null
//             if (activeLocatorElements == null || activeLocatorElements.length == 0) {
//                 return closestElementSelector
//             }
//             let activeElementDistances
//             try {
//                 activeElementDistances = activeLocatorElements.map((activeElement, index) => {
//                     let totalDistanceSqure = Math.pow(activeElement.position.x - currentEventLocator.x, 2) + Math.pow(activeElement.position.height - currentEventLocator.height, 2) + Math.pow(activeElement.position.width - currentEventLocator.width, 2)
//                     return { totalDistanceSqure, selector: activeElement.selector }
//                 })
//             } catch (error) {
//                 console.log(error)
//             }


//             let sortedItems = activeElementDistances.filter(item => { return item.totalDistanceSqure <= 500 }).sort((a, b) => { return a.totalDistanceSqure - b.totalDistanceSqure })
//             if (sortedItems.length == 0) {
//                 closestElementSelector = null
//             }
//             else {
//                 closestElementSelector = sortedItems[0]
//             }
//             return closestElementSelector

//         }

//         findActiveElements()
//         await page.waitForFunction(() => {
//             return false
//         });
//     })
//     it('should be able to detect element and run script on the fly')
//     it('should extract attribute and assign that to a variable ')
//     it("should be able to assert information on the fly")
//     it('should automatically insert wait for each element based on the real-world workflow')
//     it('should detect browser target change', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();
//         browser.on('targetchanged', target => {
//             console.log('')
//             console.log('hello world')
//         })
//         await page.waitForFunction(() => {
//             return false
//         });
//     })
//     it('should launch browser and take screenshot', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false,
//             defaultViewport: null
//         }
//         const browser = await puppeteer.launch(option)

//         const page = await browser.newPage();           // open new tab
//         await page.goto('https://google.com');          // go to site

//         // Далее #hplogo - требуемый нам селектор
//         await page.waitForSelector('.ktLKi');          // wait for the selector to load
//         const element = await page.$('.ktLKi');        // declare a variable with an ElementHandle
//         let pos = await element.boundingBox()
//         await element.screenshot({ path: 'google.png' }); // take screenshot element in puppeteer
//         await page.screenshot({ path: 'hplogo.png', clip: { x: pos.x, height: pos.height, y: pos.y, width: pos.width } })

//         await browser.close();                          // close browser

//     }).timeout(60000)

//     it('should be able to manage pages launched by the browser', async () => {
//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false,
//             defaultViewport: null
//         }
//         const browser = await puppeteer.launch(option)


//         const page = await browser.newPage();           // open new tab
//         await page.goto('https://google.com');          // go to site

//         // Далее #hplogo - требуемый нам селектор
//         let pages = await browser.pages()
//         const url = await page.url();
//         page.bringToFront();
//         console.log()

//         await browser.close();                          // close browser

//     }).timeout(60000)
// })