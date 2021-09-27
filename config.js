const path = require('path')
module.exports = {
    app: {
        port: 3600
    },
    puppeteer: {
        "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        headless: false,
        defaultViewport: null
    },
    code: {
        funcPath: path.join(__dirname, './test/sample-project/bluestone-func.js'),
        locatorPath: path.join(__dirname, './test/sample-project/bluestone-locator.js'),
        scriptFolder: path.join(__dirname, './test/sample-project/script'),
    },
    singlefile: {
        removeHiddenElements: false,
        removeUnusedStyles: false,
        removeUnusedFonts: false,
        progressBarEnabled: false,
        userScriptEnabled: false,
        removeFrames: false,
        removeImports: false,
        removeScripts: true,
        compressHTML: false,
        compressCSS: false,
        loadDeferredImages: false,
        loadDeferredImagesMaxIdleTime: 100,
        loadDeferredImagesBlockCookies: false,
        loadDeferredImagesBlockStorage: false,
        loadDeferredImagesKeepZoomLevel: false,
        filenameTemplate: "{page-title} ({date-locale} {time-locale}).html",
        infobarTemplate: "",
        includeInfobar: false,
        filenameMaxLength: 192,
        filenameReplacedCharacters: ["~", "+", "\\\\", "?", "%", "*", ":", "|", "\"", "<", ">", "\x00-\x1f", "\x7F"],
        filenameReplacementCharacter: "_",
        maxResourceSizeEnabled: false,
        maxResourceSize: 10,
        removeAudioSrc: false,
        removeVideoSrc: false,
        backgroundSave: false,
        removeAlternativeFonts: false,
        removeAlternativeMedias: false,
        removeAlternativeImages: false,
        groupDuplicateImages: false,
        saveRawPage: false,
        resolveFragmentIdentifierURLs: false,
        userScriptEnabled: false,
        saveFavicon: true,
        includeBOM: false,
        insertMetaCSP: false,
        insertMetaNoIndex: false,
        insertSingleFileComment: false
    }

}