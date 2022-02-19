let fs = require('fs')
let path = require('path')
/**
 * Create folder if it is not exists, otherwise, based on retry count, it will delete different type of file
 * retrycount=0 => all files
 * retrcount>0 => only html files because we want to perserve png file for reporting purpose
 * @param {string} folderPath 
 * @param {string} retryCount 
 */
module.exports = function (folderPath, retryCount = 0) {
    //create download folder

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
    else {
        //remove all files under the download folder
        fs.readdirSync(folderPath).forEach(file => {
            //skip png files
            if (retryCount > 0) {
                if (file.toLowerCase().includes('png')) return
            }
            let filePath = path.join(folderPath, file)
            fs.unlinkSync(filePath)
        })
    }
}