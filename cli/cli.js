const yargs = require('yargs')
const path = require('path')
const options = {
    path: {
        description: 'The path to the folder where we can find bluestone.json',
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
            .example('bluestone start --port 3600',
                'Starts on port 3600')
    })
    .command('record <url>', 'Record new workflow', recordYargs => {
        recordYargs
            .usage('Usage: mb record <url>')
            .help('help')
            .positional('url', options.url)
            .wrap(null)
            .example('mb record https://www.google.com', 'start record script against https://www.google.com ')

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