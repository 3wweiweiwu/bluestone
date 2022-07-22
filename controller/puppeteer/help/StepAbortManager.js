const KEYS = {
    stepAbortKey: 'BLUESTONE_STEP_ABORT',
    stepAbortState: {
        RUNNING: 'RUNNING',
        ABORT: 'ABORT',
        COMPLETE: 'COMPLETE'
    }
}
exports.monitorStepAbortion = async function () {
    process.env[KEYS.stepAbortKey] = KEYS.stepAbortState.RUNNING
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 200))
        switch (process.env[KEYS.stepAbortKey]) {
            case KEYS.stepAbortState.ABORT:
                return Promise.reject('Operation aborted by user')
            case KEYS.stepAbortState.COMPLETE:
                return Promise.resolve()
            default:
                break;
        }
    }
}
exports.stopStepAbortMonitor = async function () {
    process.env[KEYS.stepAbortKey] = KEYS.stepAbortState.COMPLETE
}
exports.abortStepExecution = async function () {
    process.env[KEYS.stepAbortKey] = KEYS.stepAbortState.ABORT
}