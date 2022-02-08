const test_func = require('function/test_func.js');
let locators = require('./bluestone-locator');
let svgSupport = require('./functions/validateSvg');
let validateAttribute = require('./functions/getAttribute');
let scroll = require('./functions/scroll');
let api = require('./functions/apiRequest');
module.exports = {
    validateSvgFromLink: {
        func: svgSupport.validateSvgFromLink,
        locators: []
    },
    validateAttribute: {
        func: validateAttribute.validateAttribute,
        locators: []
    },
    scroll: {
        func: scroll.scroll,
        locators: []
    },
    test_func: new test_func()
};