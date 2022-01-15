/**
 * Help to record file upload opeartion in browser
 * @param {Event} event 
 * @returns 
 */
export function fileUpload(event) {
    let createResult = function (path, base64) {
        return {
            path, base64
        }
    }
    if (event.target.files == null) {
        return []
    }
    let fileList = Array.from(event.target.files)
    //generate file name list
    let filePathList = fileList.map(file => (`${file.name}-bluestone-${Date.now()}/${file.name}`))

    //generate promise chain
    let promiseList = []
    fileList.forEach((file, i) => {
        promiseList.push(
            new Promise((resolve, reject) => {
                var reader = new FileReader();
                reader.onload = function () {
                    // the result will be returned here
                    return resolve(createResult(filePathList[i], reader.result))
                };
                reader.onerror = (err => {
                    return reject(reader.error)
                })
                reader.readAsDataURL(file);

            })
        )
    })
    Promise.all(promiseList)
        .then(result => {
            // console.log(result)
            window.saveUploadedFile(result)
        })
        .catch(err => {
            console.log(err)
            console.log('File Upload Failed!')
        })
    return filePathList

}