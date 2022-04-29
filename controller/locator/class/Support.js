module.exports = class Support {
    /**
     * Get valid file name for windows directory 
     * @param {string} fileName 
     */
    static getValidFileName(fileName) {
        //clean up unsupported name
        let forbiddenCharInFileName = ['/', "<", ">", "*", ":", '"', "\\", "/", "|", "?", "*"]
        let cleanedName = fileName
        forbiddenCharInFileName.forEach(item => {
            cleanedName = cleanedName.split(item).join('')
        })
        return cleanedName
    }
}