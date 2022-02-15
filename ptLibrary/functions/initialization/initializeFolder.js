let fs = require('fs')
let path = require('path')
module.exports = function (folderPath) {
    //create download folder

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
    }
    else {
        //remove all files under the download folder
        fs.readdirSync(folderPath).forEach(file => {
            let filePath = path.join(folderPath, file)
            fs.unlinkSync(filePath)
        })
    }
}