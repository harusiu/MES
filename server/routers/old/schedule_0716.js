var express = require('express')
var router = express.Router()

var api = require('../api/api_schedule')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

//------------------------------------------------------------------------------------------
//             排程的操作
//------------------------------------------------------------------------------------------
router.get('/searchHistory', function (req, res) {
  api.queryBetween(req, res)
})

router.get('/getLatest', function (req, res) {
  api.queryLatest(req, res)
})

router.post('/updateSchedule', function (req, res) {
  api.updateByWhere(req, res)
})

router.get('/deleteSchedule', function (req, res) {
  api.deleteByWhere(req, res)
})

module.exports = router
