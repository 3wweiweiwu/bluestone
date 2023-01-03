var express = require('express');
var router = express.Router();

//#region Entities
//import { HtmlCapture, Locator} from "./Enities/LocatorDefiner.js"
var TitleBtn = require("../controller/ui/Entities/Title")
//import {Argument, Operation, OperationGroup, CurrentOperation, OperationStatus, HtmlCaptureStatus} from "./Enities/Operations.js"
//#endregion


const titleLocatorDefiner = new TitleBtn("Operation", "/daniel/locatordefiner", "GET");
const titleOperation = new TitleBtn("Operation", "/daniel/operation", "GET");
const titleWorkflow = new TitleBtn("Operation", "/daniel/locatordefiner", "GET");

//#region Endpoints Title
router.get('/titlemenu',  async function  (req, res) {
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

// Not sure if this will be implemented
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
        let ui = req.app.locals.ui
        res.sendStatus(ui.locatorDefiner.chooseLocator(req.params.index))
    }
    catch (error)
    {
        console.log(error);
        res.status(500).send(`Error Deleting element ${req.params.index}`);
    }
})

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


//let ui = req.app.locals.ui
//res.json(ui.operation.browserSelection)
//let ui = req.app.locals.ui
//res.json(JSON.stringify(ui.backend.operationGroup))
//operationGroup[group].operations

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
        var ui = req.app.locals.ui
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

// targetStep = this.backend.steps[firstValue]
// this.__repopulateOperationUI(targetStep, firstValue)




//its the last one
router.post('/operation/htmlcaptured', (req, res) =>{
    try {
        var ui = req.app.locals.ui
        var htmlState = { "isCaptureHtml" : ui.operation.isRecordingHtml()} 
        res.json(htmlState)
    }
    catch (error){
        console.log(`${error}`)
        res.status(500).send(`Error changing the record operation`)
    }
});

module.exports = router;