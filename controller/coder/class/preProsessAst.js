let FunctionAst = require('../../ast/class/Function')
let path = require('path')
let fs = require('fs').promises
let config = require('../../../config')

const rules = {
    upload: upload,
}
/**
 * Use Rule to process ast before output
 * @param {FunctionAst[]} funcAstList 
 * @param {string} testSuite 
 * @param {string} testCase 
 * @returns {FunctionAst[]}
 */
async function astPreprosessing(funcAstList, testSuite, testCase) {
    for (const func of funcAstList) {
        let currentRule = rules[func.name]
        if (currentRule == null) continue
        await currentRule(func, testSuite, testCase)
    }

    return funcAstList
}


/**
 * Create test file under test data folder
 * @param {FunctionAst} func 
 * @param {string} testSuite 
 * @param {string} testCase 
 */
async function upload(func, testSuite, testCase) {
    //get input param
    let paramIndex = func.params.findIndex(item => { return item.type.name == 'Number' || item.type.name == 'string' || item.type.name == 'number' || item.type.name == 'Number' })
    let fileList = func.params[paramIndex].value.split(',')
    let updatedFileList = []
    //copy files over and create new file list
    for (let i = 0; i < fileList.length; i++) {
        let filePath = fileList[i]
        //if file information has been copyed already, will not do that again
        try {
            await fs.access(filePath)
        } catch (error) {
            continue
        }
        let immediateDirName = path.basename(path.dirname(filePath))
        let fileName = path.basename(filePath)
        let destinationFolder = path.join(config.code.dataPath, testCase, immediateDirName)
        let destinationFilePath = path.join(config.code.dataPath, testCase, immediateDirName, fileName)
        await fs.mkdir(destinationFolder, { recursive: true })
        await fs.copyFile(filePath, destinationFilePath)
        let relativeFilepath = path.relative(config.code.scriptFolder, destinationFilePath)
        updatedFileList.push(relativeFilepath)
    }
    //update file info. Keep file info as is if we cannot find any updated file list
    if (updatedFileList.length != 0) {
        let newFileInfo = updatedFileList.join(',')
        func.params[paramIndex].value = newFileInfo
    }


}


module.exports = astPreprosessing