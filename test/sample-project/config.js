module.exports = {
    puppeteer: {
        // "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        defaultViewport: null,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
        ]
    },

}