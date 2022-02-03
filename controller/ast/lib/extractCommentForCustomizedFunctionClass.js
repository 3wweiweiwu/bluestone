const walk = require('./walk')
const acorn = require('acorn')
async function extractCommentForCustomziedFunctionClass(jsStr) {
    let ast = acorn.parse(jsStr, { ecmaVersion: 2022 })
    
}