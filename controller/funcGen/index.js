let path = require('path')
let fs = require('fs')
let acorn = require('acorn')
let walk = require('../ast/lib/walk')
const astGenerator = require('../coder/class/AstGenerator')
const escodegen = require('escodegen')
/**
 * 
 * @param {string} relativeFuncFolder 
 * @param {string} funcName 
 */
module.exports = async function generateFunction(relativeFuncFolder, funcName) {
    //clean up functionName
    funcName = funcName.replace(/ /g, '').replace(/-/g, '_')

    let bluestonePath = process.env.bluestonePath
    let bluestoneFolder = path.dirname(bluestonePath)
    //create folder
    let folder = path.join(bluestoneFolder, 'function', relativeFuncFolder)
    try {
        await fs.promises.mkdir(folder, { recursive: true })
    } catch (error) {

    }

    //copy function template over and update function name
    let sampleFuncPath = path.join(__dirname, './sample.js')
    let sampleFileBinary = await fs.promises.readFile(sampleFuncPath)
    let sampleFileStr = sampleFileBinary.toString().replace(/exports.clearBrowserCache/g, `exports.${funcName}`)
    let newFuncPath = path.join(folder, `${funcName}.js`)
    await fs.promises.writeFile(newFuncPath, sampleFileStr)

    //register function in bluestone-func.js
    let realtiveFuncFolderToBluestoneFunc = path.relative(bluestonePath, newFuncPath)
    let bluestoneJsonPath = path.resolve(path.join(bluestoneFolder, 'bluestone-func.js'))
    let bluestoneJsonBin = await fs.promises.readFile(bluestoneJsonPath)
    let bluestoneJsonStr = bluestoneJsonBin.toString()
    let ast = acorn.parse(bluestoneJsonStr, { ecmaVersion: 2022 })
    //create require statement
    let newFuncRelativePath = path.relative(path.dirname(bluestoneJsonPath), newFuncPath)
    //convert windows-liked path to linux based path
    newFuncRelativePath = './' + newFuncRelativePath.replace(/\\/g, '/')
    //add require information to the top of the file
    let requireAst = astGenerator.getRequireStatement(funcName, newFuncRelativePath)
    ast.body.unshift(requireAst)

    //create initializer information
    let functionDeclaration = astGenerator.getNewSimpleClassExpression(funcName, funcName)
    let functionList = ast.body[ast.body.length - 1].expression.right.properties
    functionList.push(functionDeclaration)

    //generate code
    let bluestoneFunc = escodegen.generate(ast)
    await fs.promises.writeFile(bluestoneJsonPath, bluestoneFunc)

    //output function path
    return Promise.resolve(newFuncPath)
}