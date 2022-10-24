const yargs = require('yargs')
const path = require('path')
const { option } = require('yargs')
const options = {
    path: {
        description: 'The path to the folder where we can find bluestone.json',
        type: 'string'
    },
    initPath: {
        description: 'The path to the folder where we can initialize Bluestone automation project',
        type: 'string'
    },
    url: {
        description: 'The url of your website',
        type: 'string'
    },
    port: {
        default: '3600',
        description: 'the port for bluestone backend server',
        nargs: 1,
        type: 'string',
        global: false
    },
    pidfile: {
        default: 'bluestone.pid',
        description: 'where the pid is stored for the stop command',
        nargs: 1,
        type: 'string',
        global: false
    },
    'function name': {
        description: 'The name of the function. Same name will be used as function file name',
        type: 'string'
    },
    'function relative folder': {
        description: 'The directory to store the function. It will be under ./function/',
        type: 'string'
    },
    'test result': {
        description: 'The path to the result file. This result file will help with auto-healing',
        type: 'string',
    },
    'edit iteration': {
        description: 'The iteration result you would like to see. Default value:0, which is first iteration',
        type: 'number'
    },
    'tcId': {
        description: 'The name of test case. The testcase need to under ./script folder',
        type: 'string',
    }
}

let argv = yargs
    .usage('Usage: bluestone [command=start] [options...]')
    .command('start <path>', 'Starts the server based on the project specified', startYargs => {
        startYargs
            .usage('Usage: bluestone start <path>')
            .help('help')
            .wrap(null)
            .positional('path', options.path)
            .options({ port: options.port })
            .example('bluestone start ./sample_project --port 3600',
                'Starts on port 3600')
    })
    .command('edit <tcId>', 'Edit Testcase', recordYargs => {
        recordYargs
            .usage('Usage: Edit Testcase specified <tcId>. If you parse in execution report through <result> arg, auto-healing may save you maintenance time')
            .help('help')
            .positional('tcId', options.tcId)
            .options({ 'result': options['test result'] })
            .options({ 'iteration': options['edit iteration'] })
            .wrap(null)
            .example('bluestone edit testcaseName --result ./result.json', 'Edit testcaseName based on result from ./result.json')
    })
    .command('init <path>', 'Initialize Bluestone Automation Project', recordYargs => {
        recordYargs
            .usage('Usage: bluestone init')
            .help('help')
            .positional('path', options.initPath)
            .wrap(null)
            .example('bluestone init .', 'Create a Bluestone Autoamtion Project in current folder')

    })
    .command('record <url>', 'Record new workflow', recordYargs => {
        recordYargs
            .usage('Usage: bluestone record <url>')
            .help('help')
            .positional('url', options.url)
            .wrap(null)
            .example('bluestone record https://www.google.com', 'start record script against https://www.google.com ')

    })
    .command('function <function relative folder> <function name>', 'Create function template', funcYargs => {
        funcYargs
            .usage('Usage: bluestone function <folder> <name>')
            .help('help')
            .wrap(null)
            .positional('folder', options['function relative folder'])
            .positional('name', options['function name'])
            .example('bluestone function ./abc testfunction',
                'creaet a testfunction under ./function/abc/testFunction.js')
    })
    .command('compile', 'Do hot reload on customized function', funcYargs => {
        funcYargs
            .usage('Usage: bluestone compile')
            .help('help')
            .wrap(null)
            .example('bluestone compile',
                'Conduct a hot reload on customized function')
    })
    .command('install', 'Update registry for windows. Only need to run it once', () => {
    })
    .wrap(null)
    .argv
function getCommandLineArgs(command, args) {

    return args;
}
function error(message) {
    console.error(`${message}\n`);
    yargs.showHelp();
    process.exit(1); // eslint-disable-line no-process-exit
}
const command = argv._.length === 0 ? 'start' : argv._[0]
const args = getCommandLineArgs(command, argv);

module.exports = { command, args, error }