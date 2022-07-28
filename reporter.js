"use strict";
/**
 * @module JSON
 */
/**
 * Module dependencies.
 */
var Mocha = require("mocha");
var Base = Mocha.reporters.Base
var fs = require("fs");
var path = require("path");
var constants = Mocha.Runner.constants;
var EVENT_TEST_PASS = constants.EVENT_TEST_PASS;
var EVENT_TEST_PENDING = constants.EVENT_TEST_PENDING;
var EVENT_TEST_FAIL = constants.EVENT_TEST_FAIL;
var EVENT_TEST_END = constants.EVENT_TEST_END;
var EVENT_RUN_END = constants.EVENT_RUN_END;
const getErrorStepIndexByStack = require('./ptLibrary/functions/getErrorStepIndexByStack')
const VarSaver = require('./ptLibrary/class/VarSaver')
/**
 * Expose `JSON`.
 */
exports = module.exports = JSONReporter;
/**
 * Constructs a new `JSON` reporter instance.
 *
 * @public
 * @class JSON
 * @memberof Mocha.reporters
 * @extends Mocha.reporters.Base
 * @param {Runner} runner - Instance triggers reporter actions.
 * @param {Object} [options] - runner options
 */
function JSONReporter(runner, options = {}) {
    Base.call(this, runner, options);
    var self = this;
    var tests = [];
    var pending = [];
    var failures = [];
    var passes = [];
    var output;
    if (options.reporterOption) {
        if (options.reporterOption.output) {
            output = options.reporterOption.output;
        }
        if (options.reporterOption.BLUESTONE_RUN_ID) {
            process.env.BLUESTONE_RUN_ID = options.reporterOption.BLUESTONE_RUN_ID
        }
        if (options.reporterOption.BLUESTONE_AUTO_SNAPSHOT) {
            process.env.BLUESTONE_AUTO_SNAPSHOT = options.reporterOption.BLUESTONE_AUTO_SNAPSHOT
        }

    }
    runner.on(EVENT_TEST_END, function (test) {
        tests.push(test);
    });
    runner.on(EVENT_TEST_PASS, function (test) {
        passes.push(test);
    });
    runner.on(EVENT_TEST_FAIL, function (test) {
        failures.push(test);
    });
    runner.on(EVENT_TEST_PENDING, function (test) {
        pending.push(test);
    });
    runner.once(EVENT_RUN_END, function () {
        //update stats information
        let locatorUsage = getLocatorUsageStats()
        self.stats['locatorUsage'] = locatorUsage
        let varSav = VarSaver.parseFromEnvVar()
        let runId = varSav.runId
        let screenshotManager = varSav.ScreenshotReportManager.records
        var obj = {
            stats: self.stats,
            tests: tests.map(clean),
            pending: pending.map(clean),
            failures: failures.map(clean),
            passes: passes.map(clean),
            reviews: [],
            runId: runId,
            screenshotManager: screenshotManager
        };
        //further analyze passes and divide it into true pass and review categories

        let truePasses = getTruePassAndReviews(obj.passes)
        obj.passes = truePasses.passes
        obj.reviews = truePasses.reviews

        //update info in the stats field
        obj.stats.passes = obj.passes.length
        obj.stats['reviews'] = obj.reviews.length

        runner.testResults = obj;
        var json = JSON.stringify(obj, null, 2);
        if (output) {
            try {
                fs.mkdirSync(path.dirname(output), { recursive: true });
                fs.writeFileSync(output, json);
            } catch (err) {
                console.error(
                    `${Base.symbols.err} [mocha] writing output to "${output}" failed: ${err.message}\n`
                );
                process.stdout.write(json);
            }
        } else {
            process.stdout.write(json);
        }
    });
}
/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @private
 * @param {Object} test
 * @return {Object}
 */
function clean(test) {
    var err = test.err || {};
    if (err instanceof Error) {
        err = errorJSON(err);
    }
    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        file: test.file,
        duration: test.duration,
        currentRetry: test.currentRetry(),
        speed: test.speed,
        err: cleanCycles(err),
    };
}
/**
 * Replaces any circular references inside `obj` with '[object Object]'
 *
 * @private
 * @param {Object} obj
 * @return {Object}
 */
function cleanCycles(obj) {
    var cache = [];
    return JSON.parse(
        JSON.stringify(obj, function (key, value) {
            if (typeof value === "object" && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Instead of going in a circle, we'll print [object Object]
                    return "" + value;
                }
                cache.push(value);
            }
            return value;
        })
    );
}
/**
 * Transform an Error object into a JSON object.
 *
 * @private
 * @param {Error} err
 * @return {Object}
 */
function errorJSON(err) {
    var res = {};
    Object.getOwnPropertyNames(err).forEach(function (key) {
        res[key] = err[key];
    }, err);
    return res;
}
function getLocatorUsageStats() {
    let varSav = VarSaver.parseFromEnvVar()
    return varSav.healingInfo.locatorReport.usage

}
function getLocatorPrescriptionInfo() {
    let varSav = VarSaver.parseFromEnvVar()
    let prescription = varSav.healingInfo.prescriptionReport.info
    return prescription
}
class TestContext {
    constructor() {
        this.title = ''
        this.fullTitle = ''
        this.file = ''
        this.duration = ''
        this.currentRetry = 0
        this.speed = ''
        this.err = {}
    }
}
/**
 * Filter testcases and only leave testcases that we never used healing in the past
 * @param {TestContext[]} passes 
 */
function getTruePassAndReviews(passes) {
    let prescription = getLocatorPrescriptionInfo()
    let testCaseNameList = Object.keys(prescription)
    //only worry about those testcase that has prescription associate with that
    testCaseNameList = testCaseNameList.filter(item => prescription[item].length > 0)

    let filteredPasses = passes.filter(item => testCaseNameList.includes(item.title) == false)
    let reviews = passes.filter(item => testCaseNameList.includes(item.title))

    //add perscription info into log
    reviews = reviews.map(item => {
        let currentPrescription = prescription[item.title]
        item['prescription'] = currentPrescription
        return item
    })
    return {
        passes: filteredPasses,
        reviews: reviews
    }
}
JSONReporter.description = "single JSON object";
