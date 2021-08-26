let testSupport = require('./support')
let assert = require('assert')
describe('post /api/record', () => {
    it('should launch and kill new chrome instance', async () => {
        let res = await testSupport.startRecord()
        assert.strictEqual(res.status, 200)
        res = await testSupport.endRecord()
        assert.strictEqual(res.status, 200)
    }).timeout(3000)
    it('test', async () => {
        let res = await testSupport.startRecord()
        assert.strictEqual(res.status, 200)
        await page.waitForFunction(() => {
            return false
        });
    }).timeout(3000)
})