# How to write customized function
## Intent
In order to support customized workflow such as drag and drop, file upload, bluestone allow user to create customzied function.
## Sample Code
```
/**
 * Log Result
 * @name Log-Report
 * @param {string} text1 
 * @param {string} text2 
 * @param {import('puppeteer-core').Browser} browser
 * @param {import('puppeteer-core').Page} page
 * @requires locator.todoPage.todoText
 * 
 */
exports.LogConsole = function (browser, page, text1, text2) {
    console.log(`text1:${text1} text2:${text2}`)
}
```

## Highlight
* Each function should be export with exports.fun name
* The function should follow this signature: function (browser, page, arg1, arg2) {}
  * browser is puppeteer browser object
  * page is puppeteer page object
  * arg1...x is additional argument for your current function
* Each function need to be properly documented with jsdoc
  * In vscode, you can call jsdoc through following snippet: /**
  * browser oject should always follow import format {import('puppeteer-core').Browser}
  * page object should always follow import format { @param {import('puppeteer-core').Page} page}
  * For customzied function, we only support string and number