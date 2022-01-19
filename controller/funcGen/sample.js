const { Browser, Page, ElementHandle, Frame } = require('puppeteer-core')
const { ElementSelector, VarSaver } = require('bluestone').types
const bluestoneFunc = require('bluestone').func
const assert = require('assert')

/**
 * Please add description
 * @param {Frame} frame The frame interface. 
 * @param {ElementSelector} element If this function be run against element we select
 * @param {VarSaver} vars If we will use local scope
 * @param {string} stringArg1 The string value required user input
 * * @param {number} numberArg The number value required user input
 * @returns 
 */
exports.sampleFunctionName = async function (frame, element, vars, stringArg1, numberArg) {
    assert.deepEqual(1, 2, 'Current function have not been implemented') //please remove this line after implmentation
    return true //please leave this line if you don't want to return value
}