var express = require('express');
var router = express.Router();

//#region Entities
//import { HtmlCapture, Locator} from "./Enities/LocatorDefiner.js"
var TitleBtn = require("../controller/ui/Entities/Title");
var CurrentOperation = require("../controller/ui/Entities/CurrentOperation");
var WorkflowPugVue = require("../controller/ui/Entities/WorkflowPugVue");
const UI = require('../controller/ui');
//import {Argument, Operation, OperationGroup, CurrentOperation, OperationStatus, HtmlCaptureStatus} from "./Enities/Operations.js"
//#endregion


const titleLocatorDefiner = new TitleBtn("Operation", "/daniel/locatordefiner", "GET");
const titleOperation = new TitleBtn("Operation", "/daniel/operation", "GET");
const titleWorkflow = new TitleBtn("Operation", "/daniel/locatordefiner", "GET");

//#region Endpoints Title
router.get('/titlemenu',  async function  (req, res) {  //Not sure about this, think more in the design of the front
    try 
    {
        let html = [titleLocatorDefiner, titleOperation, titleWorkflow]
        res.json(html);
    }
    catch
    {
        res.status(500).send("Problem defining list of titles")
    }
})
//#endregion 

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
        res.json(potentialMatch);
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send("Error getting list of potential match");
    }
})

// Not sure if this will be implemented, need to ask weiwei, I forgot to do that
router.delete('/locatordefiner/potentialmatch/:index',  async function (req, res, next) { 
    try {
        // if (delPotentialMatch(req.params.index)){
        //     res.status(200).send(req.params.index)
        // }
        // else {
        //     res.sendStatus(204)
        // }
        next()
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send(`Error Deleting element ${req.params.index}`);
    }
})

router.post('/locatordefiner/potentialmatch/locator/:index',  async function (req, res) { 
    try {
        if(req.params.index < 0){
            res.status(400)
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
        res.status(500).send(`Error Deleting element ${req.params.index}`);
    }
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
        res.status(500).send(`Error creating the locator`)
    }
});

router.post('/locatordefiner/locator/force', async function (req, res) {
    try {
        let miss = filterLocator(req.body)
        if (miss.length>0){
            res.status(400).send(`Data missing ${miss}`)
            return
        }

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
        var ui = req.app.locals.ui
        var operations = ui.backend.getOperations
        if(operations.length > 0){
            res.json(operations)
            return
        }
        res.sendStatus(204)
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error finding the list of operations`)
    }
})

router.get("/operation/taget", (req, res) =>{
    try {
        var ui = req.app.locals.ui
        var target = ui.operation.targetInformationDaniel
        if (!target.filter().includes(['selector'])){
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
        var index = req.params.index
        if(index<0){
            res.sendStatus(400)
            return
        }
        var ui = req.app.locals.ui
        if(index >= ui.backend.steps.length){
            res.sendStatus(400)
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
        res.status(500).send(`Error finding the operation with the index ${req.params.index}`)
    }
})

router.get("/operation/htmlcaptured", (req, res) =>{
    try {
        var ui = req.app.locals.ui
        var htmlState = { "isCaptureHtml" : ui.operation.isCaptureHtml}
        res.json(htmlState)
        
    }
    catch (err){
        console.log(err)
        res.status(500).send(`Error getting the is captured Html`)
    }
})


router.get("/operation/operationmuted", (req, res) =>{
    try {
        /**
         * @type {UI}
         */
        let ui = req.app.locals.ui
        var operationsMuted = ui.operation.getFunctionMuteState()
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

function filterCurrentOperation(body){
    var curOperation = new CurrentOperation()
    curOperation.fromJson(body)
    var isCompleate = curOperation.isCompleate()
    if (isCompleate == true){
        return curOperation
    }
    return isCompleate
}

router.put('/operation/operation', (req, res) =>{
    try {
        var curOp = filterCurrentOperation(req.body)
        if(typeof(curOp) == 'string'){
            res.status(400).send(curOp)
            return
        }
        /**
        * @type {UI}
        */
        var status = 200
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

router.post('/operation/run', (req, res) =>{
    try {
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
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error adding operation`)
    }
});

router.post('/operation/resume', (req, res) =>{ //missing return to the web app
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

router.put('/operation/operationmuted', (req, res) =>{
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


router.post('/operation/htmlcaptured', (req, res) =>{
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

router.post('/operation/recording', (req, res) =>{
    try {
        /**
        * @type {UI}
        */
        var ui = req.app.locals.ui
        var htmlState = { "isRecording" : ui.operation.isRecording()} 
        res.json(htmlState)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error changing the record operation`)
    }
});
//#endregion


//#region  Workflow page
router.get('/workflow/steps', (req, res) =>{
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.getWorkflowForVue()
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error cresuming the excecution`)
        })
        .then(value =>{
            if(value.length >0){
                res.status(200).json(value)
            }
            else{
                res.sendStatus(204)
            }
        })
})

router.post('/workflow/resolve', (req, res) =>{
    var wfPugVue = new WorkflowPugVue()
    wfPugVue.fromJson(req.body)
    var isCompleate = wfPugVue.isCompleate()
    if(typeof(isCompleate) == 'string'){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.resolveVue(wfPugVue)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error Resolving Workflow Pug ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/run', (req, res) =>{
    var wfPugVue = new WorkflowPugVue()
    wfPugVue.fromJson(req.body)
    var isCompleate = wfPugVue.isRunnable()
    if(typeof(isCompleate) == 'string' || !wfPugVue.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.runWorkflow(wfPugVue)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error Running workflow ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/abort', (req, res) =>{
    var wfPugVue = new WorkflowPugVue()
    wfPugVue.fromJson(req.body)
    var isCompleate = wfPugVue.isCompleate()
    if(typeof(isCompleate) == 'string' || !wfPugVue.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.abortWorkflow(wfPugVue)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error trying to abort the excecution ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.post('/workflow/navegatetofailure', (req, res) =>{
    var wfPugVue = new WorkflowPugVue()
    wfPugVue.fromJson(req.body)
    var isCompleate = wfPugVue.isCompleate()
    if(typeof(isCompleate) == 'string' || !wfPugVue.result){
        res.status(400).send(isCompleate)
        return
    }
    /**
    * @type {UI}
    */
    var ui = req.app.locals.ui
    ui.workflow.navageteToFailure(wfPugVue)
        .catch((err)=>{
            console.log(`${err}`)
            res.status(500).send(`Error trying to abort the excecution ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

router.delete('/workflow/step/:step', (req, res) =>{    //DAniel I'm not sure what is the input needed
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

router.put('/workflow/step/:step/moveup', (req, res) =>{    //DAniel I'm not sure what is the input needed
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


router.put('/workflow/step/:step/movedown', (req, res) =>{    //DAniel I'm not sure what is the input needed
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

router.put('/workflow/step/:step/move/:index', (req, res) =>{    //DAniel I'm not sure what is the input needed
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
            res.status(500).send(`Error deleting step: ${req.params.step} error: ${err}`)
        })
        .then(value =>{
            res.status(201).json(value)
        })
})

//#endregion

module.exports = router;