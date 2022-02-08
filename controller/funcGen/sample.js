const { Browser, Page, ElementHandle, Frame } = require('puppeteer-core')
const { ElementSelector, VarSaver } = require('bluestone').types
const bluestoneFunc = require('bluestone/ptLibrary/bluestone-func');
const bluestoneType = require('bluestone/ptLibrary/class/index');
const assert = require('assert');
// const bluestoneLocator = require('../bluestone-locator');

exports.clearBrowserCache = class extends bluestoneType.BluestoneFunc {
    constructor() {
        super()
        /**
         * This is the place where you tell bluestone when to show your customized function
         * If you keep default value, your function will be showed up all the time
         * This is a bad practice because user will get confused with all the functions you have
         * You want to make your function only show up when relavent locator appears. 
         * Example: 
         * this.locators = [bluestoneLocator['Locator 1'],bluestoneLocator['Locator 2']]
         */
        this.locators = []
    }
    /**
     * This is a sample customized function. Feel free to add/modify/delete elements
     * @param {Browser} browser The puppeteer browser class
     * @param {Page} page The puppeteer page class
     * @param {Frame} frame The puppeteer frame object. 
     * @param {ElementSelector} element element this function will interact with. We can only have 1 element as input
     * @param {VarSaver} vars The scope we will use
     * @param {string} stringArg1 The string input
     * * @param {number} numberArg The number input
     * @returns 
     */
    async func(browser, page, frame, element, vars, stringArg1, numberArg) {
        try {
            //This is how we query element through bluestone. Please use this function as much as you can 
            //If you do not use this function to query element, you won't get the benefit from auto-healing!
            let eleObj = bluestoneFunc.waitElementExists.func(frame, element, 2000)
            assert.fail('This function have not been implemented')
        } catch (error) {

        }

        return true
    }

}
