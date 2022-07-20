//XMLSerializerToString class can take a target element, judge if target element is null or not
//   if it is null, then
//      stringify function will do XMLSerializer on the original document
//      recover function will do nothing
//   if it is not null, then
//      stringfy function will give an extra 'bluestone-target' attribute to the target element in document, and then 
//         XMLSerializer on the document after modification
//      recover function will remove this attribute from target element, and then recover the document to its original status

class XMLSerializerToString{
    constructor(targetElement) {
        this.__targetElement = targetElement
    }

    stringify() {
        if(this.__targetElement == null){
            return new XMLSerializer().serializeToString(document)
        }else{
            this.__targetElement.setAttribute("bluestone-target", "true")
            return new XMLSerializer().serializeToString(document)
        }
    }

    recover(){
        if(this.__targetElement != null){
            this.__targetElement.removeAttribute("bluestone-target")
        }
    }
}

