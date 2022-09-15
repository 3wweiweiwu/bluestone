var express = require('express');
var router = express.Router();
const config = require('../config')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/operation', function (req, res) {
  let eventObj = {
    event: req.body.event,
    target: req.body.target,
    arg: req.body.arg
  }
  res.io.emit("www", eventObj);
  res.send()
})
router.post('/change-property', function (req, res) {
  let eventObj = {
    event: req.body.event,
    attribute: req.body.attribute,
    value: req.body.value
  }
  res.io.emit("change-property", eventObj);
  res.send()
})
module.exports = router;
