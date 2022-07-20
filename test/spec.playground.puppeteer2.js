// const puppeteer = require('puppeteer-core')

// const fs = require('fs').promises
// const singlefileScript = require('single-file/cli/back-ends/common/scripts')
// const path = require('path')

// describe('POC - iframe', () => {
//     it('should switch iframe based on selector or xpath ', async () => {

//         let option = {
//             "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
//             headless: false,
//             args: [
//                 '--disable-web-security',
//                 '--disable-features=IsolateOrigins,site-per-process'
//             ]
//         }
//         const browser = await puppeteer.launch(option)
//         const page = await browser.newPage();




//         await page.goto('https://espn.com/login');
//         await page.waitForSelector('#disneyid-iframe')
//         let element = await page.$('#disneyid-iframe')
//         let frame = await element.contentFrame()
//         element = await frame.$x('//*[@id="did-ui-view"]/div/section/section/form/section/div[1]/div/label/span[2]/input')
//         await element[0].type('foo')


//         console.log()

//         await browser.close()


//     }).timeout(50000000)
// })