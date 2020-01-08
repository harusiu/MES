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

router.get('/getCandidateJobs', function (req, res) {   //Mingzoo 20191027
  api.getCandidateJobs(req, res)
})

////////////////////////////////////////
// for SchSettingRun.vue
router.get('/getSchSetting', function (req, res) {
  api.getSchSetting(req, res)
})

router.post('/saveSchSetting', function (req, res) {
  api.saveSchSetting(req, res)
})

////////////////////////////////////////
// for SchResult.vue
router.get('/getSchResult', function (req, res) {
  api.getSchResult(req, res)
})

router.get('/getAutoMachines', function (req, res) {
  api.getAutoMachines(req, res)
})

router.get('/getAmJobAssignments', function (req, res) {
  api.getAmJobAssignments(req, res)
})



////////////////////////////////////////
// for SchProgress.vue
router.get('/getOrders', function (req, res) {
  api.getOrders(req, res)
})

router.get('/getSchProgress', function (req, res) {
  api.getSchProgress(req, res)
})

router.post('/updateWrapupState', function (req, res) {
  api.updateWrapupState(req, res)
})

////////////////////////////////////////
// for SchErrorMsg.vue
router.get('/getDelayOrders', function (req, res) {
  api.getDelayOrders(req, res)
})

router.get('/getDueTodayOrders', function (req, res) {
  api.getDueTodayOrders(req, res)
})

router.get('/getDueTomorrowOrders', function (req, res) {
  api.getDueTomorrowOrders(req, res)
})

router.get('/getErrorMsg', function (req, res) {
  api.getErrorMsg(req, res)
})

router.get('/getOrderNoPP', function (req, res) {
  api.getOrderNoPP(req, res)
})



module.exports = router
