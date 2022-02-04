let os = require('os')
let path = require('path')
const chokidar = require('chokidar')
const { RecordingStep } = require('../../record/class')
const fs = require('fs').promises
const logEvent = require('../exposure/logEvent')

class DownloadWatcher {
    /**
     * 
     * @param {import('../../record/class').WorkflowRecord} record add step function to add recording step
     */
    constructor(record) {
        this.__downloadFolder = path.join(os.tmpdir(), 'bluestone-download-' + Date.now().toString())
        this.watch = chokidar.watch(this.downloadFolder, { ignored: /^\.$/, persistent: true });
        this.__fileTracker = {}
        this.logEvent = logEvent
        this.record = record
    }
    get downloadFolder() {
        return this.__downloadFolder
    }
    /**
     * 
     * @param {*} fileTracker 
     * @param {import('../../record/class').WorkflowRecord} record add step function to add recording step
     * @param {*} logEvent 
     */
    async addStep(fileTracker, record, logEvent, path) {
        let currentTime = Date.now()
        let startTime = currentTime
        let elapsedTime = 500
        if (fileTracker[path]) {
            startTime = fileTracker[path]
            elapsedTime = currentTime - startTime
        }
        delete fileTracker[path]

        let step = new RecordingStep({
            command: 'waitForDownloadComplete',
            target: record.operation.browserSelection.currentSelector,
            iframe: '[]',
        })
        step.timeStamp = currentTime
        step.timeoutMs = elapsedTime
        step.parameter = elapsedTime
        step.potentialMatch = record.operation.browserSelection.potentialMatch
        step.targetPicPath = record.operation.browserSelection.selectorPicture
        logEvent(record)(step)
    }
    async startWatching() {
        //create download folder
        try {
            await fs.access(this.downloadFolder)
            let fileList = await fs.readdir(this.downloadFolder)
            for (const file of fileList) {
                await fs.unlink(file)
            }
        } catch (error) {
            await fs.mkdir(this.downloadFolder, { recursive: true })
        }

        let fileTracker = this.__fileTracker
        let record = this.record
        let addStep = this.addStep
        this.watch
            .on('add', function (path) {
                console.log('File', path, 'has been added');

                if (path.includes('.crdownload')) {
                    //long running task will generate crdownload file
                    path = path.replace('.crdownload', '')
                    fileTracker[path] = Date.now()
                }
                else {
                    addStep(fileTracker, record, logEvent, path)
                }

            })
            .on('change', function (path) {
                //will not record the change from chrome download file
                if (path.includes('.crdownload')) {
                    return
                }
                addStep(fileTracker, record, logEvent, path)
                console.log('File', path, 'has been changed');


            })
    }
}

module.exports = DownloadWatcher