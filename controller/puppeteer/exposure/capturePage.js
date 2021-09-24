const { WorkflowRecord } = require('../../record/class/index')
const { Page, Browser } = require('puppeteer-core')



/**
 * Run current operation
 * @param {Page} page 
 */
module.exports = function (page) {

    return async function () {
        let pageData = await page.evaluate(async options => {
            const DEFAULT_OPTIONS = {
                removeHiddenElements: false,
                removeUnusedStyles: false,
                removeUnusedFonts: false,
                removeFrames: false,
                removeImports: false,
                removeScripts: false,
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
                backgroundSave: true,
                removeAlternativeFonts: false,
                removeAlternativeMedias: false,
                removeAlternativeImages: false,
                groupDuplicateImages: true,
                saveRawPage: false,
                resolveFragmentIdentifierURLs: false,
                userScriptEnabled: false,
                saveFavicon: true,
                includeBOM: false,
                insertMetaCSP: false,
                insertMetaNoIndex: false,
                insertSingleFileComment: false
            };
            const pageData = await singlefile.getPageData(DEFAULT_OPTIONS);
            return pageData;
        });
        return pageData

    }
}