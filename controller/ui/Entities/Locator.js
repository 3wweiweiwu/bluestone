class Locator 
{
    constructor (name, selector, pic, index = -1,msg = null)
    {
        this.name = name
        this.selector = selector
        this.pic = pic
        this.index = index   
        this.msg = msg
    }
    
    fromJson(json) {
        Object.assign(this, json);
    }

    filter(){
        let missing = []
        let needed = ['name', 'selector', 'pic']
        needed.forEach(key => {
            if(!this[key]) { 
                missing.push(key)}
            });
        return missing
    }

}

module.exports = Locator;