
const path = require('path')
var _eval = require('eval')

const s1 = async function (input1) {
    console.log(input1)
    return input1
}
describe('dynamic function evaluation', () => {
    it('run function in the fly', (done) => {


        var res = _eval(`
            s1('hello').then(item=>{module.exports=item})
        `, 'dummy.js', { s1 }, false)

        console.log(res)
    }).timeout(60000)
})
