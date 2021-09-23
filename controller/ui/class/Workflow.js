class WorkFlowPug {
    constructor(command, target, argDic) {
        this.command = command
        this.target = target
        this.argument = JSON.stringify(argDic)
    }
    /**
     * Generate Pug-compatible array format
     * @returns {Array<string>}
     */
    generatePugOutput() {
        return [this.command, this.target, this.argument]
    }

}

module.exports = WorkFlowPug