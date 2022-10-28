let fs = require('fs').promises
let fsExtra = require('fs-extra')
const { dirname } = require('path')
let path = require('path')
const process = require('process')
const child_process = require('child_process');

async function main(targetAbsoluteFolder) {
    //test if folder is exists, if not, create a new folder
    try {
        await fs.access(targetAbsoluteFolder)
    } catch (error) {
        try {
            await fs.mkdir(targetAbsoluteFolder, { recursive: true })
        } catch (error) {
            console.error(`Unable to create folder in ${targetAbsoluteFolder}`)
            console.debug(error)
        }
    }
    //test if target folder is empty. If not throw error and return
    let files = []
    files = await fs.readdir(targetAbsoluteFolder)
    if (files.length != 0) {
        console.error(`Cannot initialize Bluestone proejct in ${targetAbsoluteFolder}. Current Folder is not empty! Please delete all files and folder in it or create project in a different folder`)
        return
    }

    //copy sample project to target folder    
    let bluestoneSampleFolder = path.join(__dirname, '../../node_modules/bluestone-sample-project')
    console.log(`Copy File from ${bluestoneSampleFolder} to ${targetAbsoluteFolder}`)
    try {

        fsExtra.copySync(bluestoneSampleFolder, targetAbsoluteFolder)
    } catch (error) {
        console.error(`Unable to copy from ${bluestoneSampleFolder} to ${targetAbsoluteFolder}`)
        console.debug(error)
        return
    }

    //perform npm install to target folder
    console.log('Install Dependencies')
    try {
        child_process.spawnSync(`npm.cmd`, ['install', '--silent'], { cwd: targetAbsoluteFolder, stdio: 'inherit' })

    } catch (error) {
        console.error(`Installation failed. Please manually run "npm install" in ${targetAbsoluteFolder}`)
        console.debug(error)
        return
    }
    console.log()
    console.log('Project Initialization Complete.')
    console.log(`Launch the runner with command: bluestone start '${targetAbsoluteFolder}'`)

}
module.exports = main