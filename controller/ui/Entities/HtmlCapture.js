
class HtmlCapture 
{
    constructor (htmlPic = null, htmlCode = null)
    {
        this.__htmlCode = htmlCode
        this.__htmlPic = htmlPic
    }

    isEmpty(){
        if (this.__htmlCode == null && this.htmlPic == '') {
            return true
        }
    }

    isEqual(other) {
        if (other instanceof HtmlCapture) {
            if (this.__htmlCode == other.__htmlCode && this.htmlPic == this.__htmlPic) {
                return true
            }
        }
        else {
            return false
        }
    }

    get htmlPic(){
        return this.__htmlPic
    }
    get htmlCode(){
        return this.__htmlCode
    }
    set htmlPic(val){
        this.__htmlPic = val
    }
    set htmlCode(val){
        this.__htmlCode = val
    }
}

module.exports = HtmlCapture;