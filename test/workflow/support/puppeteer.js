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
        tabWorkflow: {
            locator: ['//A[text()=\'Workflow\']'],
            screenshot: 'componentPic/Label_Batch_Genealogy___Batch_Information.png',
            displayName: 'Tab Workflow'
        }
    }
}
