var express = require('express')
var router = express.Router()

var api = require('../api/api_equip')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.get('/queryAll', function (req, res) {
  api.queryAll(req, res)
})

router.get('/queryByWhere', function (req, res) {
  api.queryByWhere(req, res)
})

router.get('/getColumnItems', function (req, res) {
  api.getColumnItems(req, res)
})

router.post('/updateData', function (req, res) {
  api.updateData(req, res)
})

router.post('/insertData', function (req, res) {
  api.insertData(req, res)
})

//------------------------------------------------------------------------------------------
//             設備的操作
//------------------------------------------------------------------------------------------
router.get('/getAllEquipments', function (req, res) {
  api.getAllEquipments(req, res)
})

router.get('/checkId', function (req, res) {
  api.checkId(req, res)
})

router.get('/checkOthersId', function (req, res) {
  api.checkOthersId(req, res)
})

router.get('/getEquipLineItems', function (req, res) {
  api.getEquipLineItems(req, res)
})

router.get('/getLineName', function (req, res) {
  api.getLineName(req, res)
})

router.get('/getEquipment', function (req, res) {
  api.getEquipment(req, res)
})

router.get('/queryEquipment', function (req, res) {
  api.queryEquipment(req, res)
})

router.get('/deleteEquipment', function (req, res) {
  api.deleteEquipment(req, res)
})

router.post('/insertUpdateEquipment', function (req, res) {
  api.insertUpdateEquipment(req, res)
})

router.post('/insertEquipment', function (req, res) {
  api.insertEquipment(req, res)
})

router.post('/updateEquipment', function (req, res) {
  api.updateEquipment(req, res)
})

module.exports = router
