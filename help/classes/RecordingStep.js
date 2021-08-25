/**
 * @typedef {number} CommandType
 **/


/**
 * @enum {CommandType}
 */
var TYPES = {
    CLICK: 1,
    GOTO: 2,
    TYPE: 3,
    ASSERT: 4
}

/**
 * @typedef RecordingStep
 * @property {CommandType} command
 * @property {number} target
 * @property {number} parameter
 * @property {number} timestamp
 */