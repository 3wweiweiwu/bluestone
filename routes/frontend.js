var express = require('express');
var router = express.Router();

//#region Entities
//import { HtmlCapture, Locator} from "./Enities/LocatorDefiner.js"
var CurrentOperation = require("../controller/ui/Entities/CurrentOperation");
var TestCase = require("../controller/ui/Entities/TestCase");
const UI = require('../controller/ui');
//import {Argument, Operation, OperationGroup, CurrentOperation, OperationStatus, HtmlCaptureStatus} from "./Enities/Operations.js"
//#endregion


const potentialmMatchHref = 'potentialmatch/' // endpoint to choose a potential match in Locator Definer Page
const runHref = 'run' // endpoint button run in Operaiton page
const addHref = 'operation' // endpoint button run in Operaiton page
const moveHref = 'move/' // endpoint move step in Locator Definer Page
const moveupHref = 'moveup' // endpoint move step up in Locator Definer Page
const movedownHref = 'movedown' // endpoint move step down in Locator Definer Page
const deleteHref = 'step/' // endpoint move step in Locator Definer Page


//#region Locator definer

//function name getSrcToDisplayInSideBar
//I can't find the option to retun
router.get('/locatordefiner/htmlwebpage', async function  (req, res)  {
    /**
    * @type {UI}
    */
    let ui = req.app.locals.ui
    try{
        let htmlCapture = ui.locatorDefiner.getSrcToDisplayInSideBarDaniel()
        if (htmlCapture.isEmpty()){
            res.sendStatus(204)
            return
        }
        res.json(htmlCapture)
    }
    catch
    {
        res.status(500).send("Problem creating HtmlCapture")
    }

    // var cookies = cookie.parse(req.headers.cookie || '');
    // console.log(cookies.htmlCaputure)
    // try {
    //     //var htmlCapture = getHtmlCapture(cookies.htmlCaputure)
    //     if (htmlCapture.isEqual(new HtmlCapture())){
    //         res.sendStatus(204)
    //     }
    //     res.json(htmlCapture)
    // }
    
})

router.get('/locatordefiner/possiblelocator',  async function (req, res) {  //TO DO Missing input
    try {
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        let possiblelocator = ui.locatorDefiner.getRecommendedLocatorDaniel()
        if (possiblelocator.length == 0){
            res.sendStatus(204);
            return
        }
        res.json(possiblelocator);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("Error getting list of possible locator");
    }
})

router.get('/locatordefiner/potentialmatch',  async function (req, res) { 
    try {
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        let potentialMatch = ui.locatorDefiner.potentialMatchDaniel;
        if (potentialMatch.length == 0){
            res.sendStatus(204);
            return;
        }
        let pMatchReturn = potentialMatch.map((element) => {
            element.href = potentialmMatchHref + element.index.toString();
            return element;
        })
        res.json(pMatchReturn);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("Error getting list of potential match");
    }
})


router.post(`/locatordefiner/${potentialmMatchHref}:index`,  async function (req, res) { 
    try {
        if(parseInt(req.params.index) < 0){
            res.sendStatus(400)
            return
        }
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        res.sendStatus(ui.locatorDefiner.chooseLocator(req.params.index))
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send(`Error Choosing element ${req.params.index}`);
    }
})

router.post('/locatordefiner/update/target/:step', (req, res)=>{
    var index = req.params.step
    if(index<0){
        res.sendStatus(400)
        return
    }
    //filter to validate input
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    if(index >= ui.backend.steps.length){
        res.sendStatus(204)
        return
    }
    ui.updateTargetVue(index)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Updating target from step: ${req.params.step} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

/**
 * Verify that the body of the request has the parameters name and selector, if there is missing someone of them returns a list with the values
 * @param {json} locator 
 * @returns 
 */
function filterLocator(locator){
    let missing = []
    let needed = ['name', 'selector']
    needed.forEach(key => {
        if(!locator[key]) { 
            missing.push(key)}
        });
    return missing
}

router.post('/locatordefiner/locator', async function (req, res) {
    try {
        let miss = filterLocator(req.body)
        if (miss.length>0){
            res.status(400).send(`Data missing ${miss}`)
            return
        }
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        let locator = await ui.locatorDefiner.addLocator(req.body)
        if (locator.msg == ''){
            res.status(201).json(locator)
            return
        }
        res.status(409).json(locator)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(error.message)
    }
});

router.post('/locatordefiner/locator/force', async function (req, res) {
    try {
        let miss = filterLocator(req.body)
        if (miss.length>0){
            res.status(400).send(`Data missing ${miss}`)
            return
        }
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        await ui.locatorDefiner.forceLocator(req.body)  //I think that we can quit the await, and just return a 202, because we don't care about the response
        res.sendStatus(201)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error creating the locator`)
    }
});

router.post('/locatordefiner/locator/revert', async function (req, res) {
    try {
        /**
        * @type {UI}
        */
        let ui = req.app.locals.ui
        let locator = ui.locatorDefiner.revertLocator()
        res.status(201).json(locator)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error creating the locator`)
    }
});
//#endregion


//#region Operations Page
router.get("/operation/operations", (req, res) =>{
    try {
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        var lstOperations = ui.backend.getOperations
        if(lstOperations.length > 0){
            let linksJson = {
                run : runHref,
                add : addHref
            }
            resp = {
                operations: lstOperations,
                links: linksJson
            }
            res.json(resp)
            return
        }
        res.sendStatus(204)
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error finding the list of operations`)
    }
})

router.get("/operation/target", (req, res) =>{
    try {
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        var target = ui.operation.targetInformationDaniel
        let missing = target.filter()
        if (!missing.includes('selector')){
            res.json(target)
        }
        else {
            res.sendStatus(204)
        }
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error finding the picture of the Target`)
    }
})

router.get("/operation/operation/:index", (req, res) =>{
    try {
        var index = parseInt(req.params.index)
        if(index<0){
            res.sendStatus(400)
            return
        }
        var ui = req.app.locals.ui
        if(index >= ui.backend.steps.length){
            res.sendStatus(204)
            return
        }
        var operation =  ui.operation.getOperationByIndex(req.params.index)
        if (operation){
            res.status(200).json(operation)
        }
        else {
            res.sendStatus(204)
        }
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error finding the step with the index ${req.params.index}`)
    }
})


function filterCurrentOperation(body){
    var curOperation = new CurrentOperation()
    curOperation.fromJson(body)
    var isCompleate = curOperation.isCompleate()
    if (isCompleate == true){
        return curOperation
    }
    return isCompleate
}

router.put(`/operation/${addHref}`, (req, res) =>{
    try {
        try {
            var curOp = filterCurrentOperation(req.body)
        } catch (err){
            var curOp = "Error in the request"
            console.log(curOp)
        }
        if(typeof(curOp) == 'string'){
            res.status(400).send(curOp)
            return
        }
        var status = 200
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        if (curOp.index >= ui.backend.steps.length || curOp.index < 0){
            curOp.index = null
            status = 201
        }
        ui.operation.addOrModifyStepDaniel(curOp)
            .catch(err =>{
                console.log(`${err}`)
                res.status(500).send(`Error adding operation`)
            })
            .then(value =>{
                res.status(status).json(value)
            })
        
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error adding operation`)
    }
});

router.post(`/operation/${runHref}`, (req, res) =>{
    var curOp = filterCurrentOperation(req.body)
    if(typeof(curOp) == 'string'){
        res.status(400).send(curOp)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.operation.runOperation(curOp)
        .then(value=>{
            res.json(value)
        })
        .catch(err => {
            console.log(`${err}`)
            res.status(500).send(`Error adding operation`)
        })
});

//#endregion


//#region  Workflow page
router.get('/workflow/steps', (req, res) =>{
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.getWorkflowForVue()
        .then(value =>{
            if(value.length >0){
                let resp = value.map((val, index) => {
                    let href = {
                        index: index,
                        move: moveHref,
                        moveup: index.toString() + '/' + moveupHref,
                        movedown: index.toString() + '/' + movedownHref,
                        deleteHref: deleteHref + index.toString()
                    }
                    val.links = href
                    return val
                })
                res.status(200).json(resp)
            }
            else{
                res.sendStatus(204)
            }
        })
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error cresuming the excecution`)
        })
})

router.post('/workflow/resolve', (req, res) =>{
    var tc = new TestCase()
    tc.fromJson(req.body)
    var isCompleate = tc.isCompleate()
    if(typeof(isCompleate) == 'string'){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.resolveVue(tc)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error Resolving Workflow Pug ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/run', (req, res) =>{
    var tc = new TestCase()
    tc.fromJson(req.body)
    var isCompleate = tc.isRunnable()
    if(typeof(isCompleate) == 'string' || !tc.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.runWorkflow(tc)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error Running workflow ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/abort', (req, res) =>{
    var tc = new TestCase()
    tc.fromJson(req.body)
    var isCompleate = tc.isCompleate()
    if(typeof(isCompleate) == 'string' || !tc.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.abortWorkflow(tc)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error trying to abort the excecution ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/navegatetofailure', (req, res) =>{
    var tc = new TestCase()
    tc.fromJson(req.body)
    var isCompleate = tc.isCompleate()
    if(typeof(isCompleate) == 'string' || !tc.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.navageteToFailure(tc)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error trying to abort the excecution ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.delete(`/workflow/${deleteHref}:step`, (req, res) =>{    //DAniel I'm not sure what is the input needed
    var index = req.params.step
    if(index<0){
        res.sendStatus(400)
        return
    }
    //filter to validate input
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    if(index >= ui.backend.steps.length){
        res.sendStatus(204)
        return
    }
    ui.workflow.deleteStep(index)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error deleting step: ${req.params.step} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.put(`/workflow/step/:step/${moveupHref}`, (req, res) =>{    //DAniel I'm not sure what is the input needed
    var index = req.params.step
    if(index<0){
        res.sendStatus(400)
        return
    }
    //filter to validate input
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    if(index >= ui.backend.steps.length){
        res.sendStatus(204)
        return
    }
    ui.workflow.moveStepUp(index)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error deleting step: ${req.params.step} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})


router.put(`/workflow/step/:step/${movedownHref}`, (req, res) =>{    //DAniel I'm not sure what is the input needed
    var index = req.params.step
    if(index<0){
        res.sendStatus(400)
        return
    }
    //filter to validate input
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    if(index >= ui.backend.steps.length){
        res.sendStatus(204)
        return
    }
    ui.workflow.moveStepDown(index)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error deleting step: ${req.params.step} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.put(`/workflow/step/:step/${moveHref}:index`, (req, res) =>{    //DAniel I'm not sure what is the input needed
    var step = req.params.step
    var index = req.params.index
    if(index<0 || step<0){
        res.sendStatus(400)
        return
    }
    //filter to validate input
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    if(index >= ui.backend.steps.length || step>= ui.backend.steps.length){
        res.sendStatus(204)
        return
    }
    var diff = index - step
    ui.workflow.moveStepToIndex(step, diff)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error moving step: ${req.params.step} to ${index} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

//#endregion


//#region Settings Page
router.get("/settings/htmlcaptured", (req, res) =>{
    try {
        /**
         * @type {UI}
         */
        var ui = req.app.locals.ui
        var htmlState = { "isCaptureHtml" : ui.operation.isCaptureHtml}
        res.json(htmlState)
        
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error getting the is captured Html`)
    }
})

router.get("/settings/recording", (req, res) =>{
    try {
        /**
         * @type {UI}
         */
        var ui = req.app.locals.ui
        var recordingState = { "isRecording" : ui.operation.getIsRecording}
        res.json(recordingState)
        
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error getting the is captured Html`)
    }
})

router.get("/settings/operationmuted", (req, res) =>{
    try {
        /**
         * @type {UI}
         */
        let ui = req.app.locals.ui
        var operationsMuted = ui.operation.getFunctionMuteStateVue()
        if(operationsMuted.length > 0){
            res.json(operationsMuted)
        }
        else{
            res.sendStatus(204)
        }
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error getting the list of operations captured`)
    }
})

router.post('/settings/resume', (req, res) =>{ //missing return to the web app
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.operation.resume()
        .then(()=>{
            res.sendStatus(201)
        })
        .catch(err=>{
            console.log(`${err}`)
            res.status(500).send(`Error with resume option`)
        })
});

router.put('/settings/operationmuted', (req, res) =>{
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.backend.updateMutedFunctionForRecordingDaniel(req.query.operation)
        .then((value)=>{
            if(value == true){
                res.sendStatus(201)
            }
            else{
                res.sendStatus(204)
            }
        })
        .catch(err=>{
            console.log(`${err}`)
            res.status(500).send(`Error Updating operatin muted for ${req.params.operation}`)
        })
});


router.post('/settings/htmlcaptured', (req, res) =>{
    try {
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        var htmlState = { "isCaptureHtml" : ui.operation.isRecordingHtml()} 
        res.json(htmlState)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error changing the record operation`)
    }
});

router.post('/settings/recording', (req, res) =>{
    try {
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        var htmlState = { "isRecording" : ui.operation.isRecording()} 
        res.statusCode = 200;
        res.json(htmlState);
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error changing the record operation`)
    }
});
//#endregion


module.exports = router;