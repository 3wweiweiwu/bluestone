exports.config = {
    // "executablePath": "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1040',
    ],
    ignoreDefaultArgs: ['--disable-extensions']
}
exports.Locator = {
    Operation: {
        txtSelector: {
            locator: ['//input[@querykey=\'txtSelector\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        DropDnMenu1: {
            locator: ['//div[2]/button[@data-toggle=\'dropdown\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        DropDnMenu1_Verify: {
            locator: ['//a[@href=\'spy?currentGroup=assert\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        DropDnMenu2: {
            locator: ['//div[3]/button[@data-toggle=\'dropdown\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        DropDnMenu1_TxtEqual: {
            locator: ['//a[@href=\'spy?currentOperation=testTextEqual\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        btn_AddStep: {
            locator: ['//div//a[@href=\'?btnAddStep\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        argumentInput_0:{
            locator: ['//input[@id=\'currentArgument_0\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        },
        argumentLabel_0:{
            locator: ['//label[@for=\'currentArgument_0\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Selector'
        }
    }
}
