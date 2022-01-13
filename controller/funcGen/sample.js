const { Browser, Page, ElementHandle, Frame } = require('puppeteer')
const bluestoneFunc = require('bluestone') //where bluestone in-built function is stored
const locator = require('../bluestone-locator') //contains all locator in the project
const assert = require('assert') //assertion library

/**
 * Please add description
 * @param {Frame} frame The frame interface. 
 * @param {ElementHandle} element If this function be run against element we select
 * @param {string} stringArg1 The string value required user input
 * * @param {number} numberArg The number value requirement user input
 * @returns 
 */
exports.sampleFunctionName = async function (frame, element, stringArg1, numberArg) {
    assert.deepEqual(1, 2, 'Current function have not been implemented') //please remove this line after implmentation
    return true //please leave this line as is
}