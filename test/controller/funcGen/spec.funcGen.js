const assert = require('assert')
const path = require('path')
const fs = require('fs').promises
const funcGen = require('../../../controller/funcGen/index')

describe('function generator', () => {
    it('should add new function into bluestone-func.js correctly', async () => {
        //restore bluestone-func.js
        let bluestoneFuncPath = path.join(__dirname, './sample/bluestone-func.js')
        let bluestoneFuncBakPath = path.join(__dirname, './sample/bluestone-func.bak.js')
        try {
            await fs.unlink(bluestoneFuncPath)
        } catch (error) {

        }
        await fs.copyFile(bluestoneFuncBakPath, bluestoneFuncPath)

        //remove existing function file if there is any
        let funcName = 'test_func'
        let funcPath = path.join(__dirname, './sample/function/', funcName)
        try {
            await fs.unlink(funcPath)
        } catch (error) {

        }
        //start to hook up file
        process.env.bluestonePath = path.join(__dirname, './sample')
        await funcGen('', funcName)

        //test function file is generated correctly
        let fileContent = (await fs.readFile(funcPath + '.js')).toString()
        let fileContentBase = (await fs.readFile(funcPath + '.js_base')).toString()
        //this is change we made to the original file
        fileContentBase = fileContentBase.replace(/exports.clearBrowserCache/g, `exports.${funcName}`)
        assert.deepEqual(fileContent, fileContentBase, 'File content does not match with baseline')

        //test if function has been correctly added to bluestone-func.js
        let bluestoneFuncBasePath = path.join(__dirname, './sample/bluestone-func.base.js')
        let bluestoneFuncStr = (await fs.readFile(bluestoneFuncPath)).toString()
        let bluestoneFuncBaseline = (await fs.readFile(bluestoneFuncBasePath)).toString()
        assert.deepEqual(bluestoneFuncStr, bluestoneFuncBaseline, 'bluestone-func.js does not match with baseline')


        console.log()
    }).timeout(999999)
})