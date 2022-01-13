let path = require('path')
let fs = require('fs')
/**
 * 
 * @param {string} relativeFuncFolder 
 * @param {string} funcName 
 */
module.exports = async function generateFunction(relativeFuncFolder, funcName) {
    //clean up functionName
    funcName = funcName.replace(/ /g, '')

    let bluestonePath = process.env.bluestonePath
    //create folder
    let folder = path.join(bluestonePath, 'function', relativeFuncFolder)
    try {
        await fs.promises.mkdir(folder, { recursive: true })
    } catch (error) {

    }

    //copy function template over and update function name
    let sampleFuncPath = path.join(__dirname, './sample.js')
    let sampleFileBinary = await fs.promises.readFile(sampleFuncPath)
    let sampleFileStr = sampleFileBinary.toString().replace(/exports.sampleFunctionName/g, `exports.sampleFunctionName.${funcName}`)
    let newFuncPath = path.join(folder, `${funcName}.js`)
    await fs.promises.writeFile(newFuncPath, sampleFileStr)

    //register function in bluestone-func.js
    let realtiveFuncFolderToBluestoneFunc = path.relative(bluestonePath, newFuncPath)
    let bluestoneJsonPath = path.resolve(path.join(bluestonePath, 'bluestone-func.js'))
    let bluestoneJsonBin = await fs.promises.readFile(bluestoneJsonPath)
    let bluestoneJsonStr = bluestoneJsonBin.toString()
    let jsonStrBlocks = bluestoneJsonStr.split('module.exports')
    let importField = jsonStrBlocks[0]
    let scriptBlock = ''




}