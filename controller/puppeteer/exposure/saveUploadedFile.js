const fs = require('fs').promises
const { RecordingStep, COMMAND_TYPE, WorkflowRecord } = require('../../record/class/index')
const os = require('os')
const path = require('path')
/**
 * 
 * @param {WorkflowRecord} record 
 * @returns 
 */
exports.saveUploadedFile = function saveUploadedFile(record) {
    /**
     * Transfer the uploaded file to local disk
     * @param {FileUploadInfo[]} fileList 
     */
    async function main(fileList) {
        if (!record.isRecording) return
        for (const file of fileList) {
            let base64 = file.base64.split(';base64,').pop();

            let folderName = file.path.split('/')[0]
            let fileFolder = path.join(os.tmpdir(), folderName)
            await fs.mkdir(fileFolder)

            let filePath = path.join(os.tmpdir(), file.path)

            await fs.writeFile(filePath, base64, { encoding: 'base64' })
        }

    }
    return main
}

exports.getUploadFilePath = function getUploadFilePath(fileName) {
    return path.join(os.tmpdir(), fileName)
}
class FileUploadInfo {
    /**
     * Create Entry for each file we upload
     * @param {string} name 
     * @param {string} base64 
     */
    constructor(name, base64) {
        this.name = name
        this.base64 = base64
    }
}