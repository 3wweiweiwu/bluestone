const TestcaseLoader = require('../../controller/ast/TestCaseLoader')
const path = require('path')
/**
 * 
 * @param {string} filePath the path to the testcase
 * @param {string} errorStack The stack information from Error
 */
function getErrorStepIndexByErrorStack(filePath, errorStack) {
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
        stepIndex = lineNumber
    } catch (error) {
        return stepIndex
    }

    return stepIndex
}
module.exports = getErrorStepIndexByErrorStack