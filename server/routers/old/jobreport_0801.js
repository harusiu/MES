var express = require('express')
var router = express.Router()

var api = require('../api/api_jobreport')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
  console.log("none work");
})

//------------------------------------------------------------------------------------------
//             排程的操作
//------------------------------------------------------------------------------------------
router.post('/updateByWhere', function (req, res) {
  api.updateByWhere(req, res)
})
router.post('/updateByKey', function (req, res) {
  api.updateByKey(req, res)
})
router.post('/queryByWhere', function (req, res) {
  //console.log(req);
  api.queryByWhere(req, res)
})
router.post('/insert_into', function (req, res) {
  console.log("insert_into");
  console.log(req.body.data);
  api.insert_into(req, res)
})


module.exports = router
