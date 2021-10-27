const path = require('path')
const fs = require('fs')
let config = {
    app: {
        port: process.env.port || 3600
    },
    puppeteer: {
        headless: false,
        defaultViewport: null,
        args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']

    },
    bluestoneJson: path.join(__dirname, './test/sample-project/bluestone.json'),
    code: {
        funcPath: path.join(__dirname, './test/sample-project/bluestone-func.js'),
        locatorPath: path.join(__dirname, './test/sample-project/bluestone-locator.js'),
        scriptFolder: path.join(__dirname, './test/sample-project/script'),
        configPath: path.join(__dirname, './test/sample-project/config.js'),
        inbuiltFuncPath: path.join(__dirname, './ptLibrary/bluestone-func.js'),
        pictureFolder: path.join(__dirname, './test/sample-project/componentPic'),
        urlBlackList: []
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
        saveFavicon: false,
        includeBOM: false,
        insertMetaCSP: false,
        insertMetaNoIndex: false,
        insertSingleFileComment: false
    }

}
function configFunc() {
    let projectInfo = fs.readFileSync(config.bluestoneJson)
    let projectObj = JSON.parse(projectInfo.toString())
    let projectFolder = path.dirname(config.bluestoneJson)
    config.code.funcPath = path.join(projectFolder, projectObj.function)
    config.code.locatorPath = path.join(projectFolder, projectObj.locator)
    config.code.scriptFolder = path.join(projectFolder, projectObj.test)
    config.code.configPath = path.join(projectFolder, projectObj.config)
    config.code.pictureFolder = path.join(projectFolder, projectObj.pic)
    config.code.urlBlackList = projectObj.urlBlackList
    return config
}


module.exports = configFunc()