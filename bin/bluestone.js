#!/usr/bin/env node


const startService = require('./www')
const cli = require('../cli/cli')
const path = require('path')
const fs = require('fs').promises
const fsSync = require('fs')
const axios = require('axios').default
let config = require('../config')
function getPidPath() {
    return path.join(__dirname, 'bluestone.pid')
}

function getRuntimeInfo() {
    let runTime = {}
    let runtimePath = getPidPath()
    try {
        let runTimeInfo = fsSync.readFileSync(runtimePath)
        runTime = JSON.parse(runTimeInfo)
    } catch (error) {

    }
    return runTime
}
function serverAt(options) {
    async function start(port) {
        // Set in case npm dependencies do anything with this
        if (!process.env.NODE_ENV) {
            process.env.NODE_ENV = 'production';
        }
        if (!process.env.BLUESTONE_SIMULATOR) {
            process.env.BLUESTONE_SIMULATOR = '1';
        }
        let pidPath = getPidPath()
        let runtime = {
            pid: process.pid,
            port: port
        }
        startService(port)
        fs.writeFile(pidPath, JSON.stringify(runtime))

    }
    return { start }
}
try {
    const server = serverAt(cli.args);
    let bluestoneUrl = ''
    let runTime = getRuntimeInfo()
    let bluestoneJsonPath = ''
    let port = runTime.port
    switch (cli.command) {

        case 'start':
            //test bluestone.json file

            if (fsSync.existsSync(cli.args.path)) {
                //check if it working out-of-box
                process.env.bluestonePath = path.join(path.resolve(cli.args.path), 'bluestone.json')
            }
            else {
                cli.error(`Path does not contains bluestone.json: '${bluestoneJsonPath}'.`);
                break
            }
            //update port information based on current input    
            process.env.port = cli.args.port


            //refesh config.js based on current inforamtion
            let configPath = path.resolve(__dirname, '../config.js')
            delete require.cache[configPath]
            require('../config')

            //launch app
            server.start(process.env.port);
            bluestoneUrl = `http://localhost:${cli.args.port}`
            axios.get(`${bluestoneUrl}/spy`)
            break;
        case 'record':

            bluestoneUrl = `http://localhost:${port}`
            axios.post(`${bluestoneUrl}/api/record`, { url: cli.args.url })
            break;
        case 'function':
            break;
        case "compile":
            bluestoneUrl = `http://localhost:${port}`
            axios.post(`${bluestoneUrl}/api/compile`)
                .then(() => {
                    console.log('hot reload complete!')
                })
            break
        case 'help':
            cli.help();
            break;
        default:
            cli.error(`Invalid command '${cli.command}'.`);
            break;
    }



}
catch (err) {
    cli.error(err.message);
}
