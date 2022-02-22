const TestcaseLoader = require('../../controller/ast/TestCaseLoader')
const path = require('path')
/**
 * 
 * @param {string} filePath the path to the testcase
 * @param {string} errorStack The stack information from Error
 * @param {TestcaseLoader} testcase 
 */
function getErrorStepIndexByErrorStack(filePath, errorStack, testcase) {
    let stepIndex = -1
    let fileName = path.basename(filePath)
    let errorLine = errorStack.split('\n').find(item => item.includes(fileName + ":"))
    if (errorLine == null)
        return stepIndex
    let errorContext = errorLine.replace(filePath, '')
    let lineStr = errorContext.split(':')[1]

    //get line number
    let lineNumber
    try {
        lineNumber = Number.parseInt(lineStr)
    } catch (error) {
        return stepIndex
    }

    //based on line number identify which step are we in
    //-1 to get rid of initialize step as normally we will not record this
    stepIndex = testcase.steps.findIndex(item => item.scriptLineNumber == lineNumber) - 1
    return stepIndex
}
module.exports = getErrorStepIndexByErrorStack