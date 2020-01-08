var express = require('express')
var router = express.Router()

var invInApi = require('../api/invInApi')

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.get('/queryAll', function (req, res) {
  invInApi.queryAll(req, res)
})

router.get('/queryByWhere', function (req, res) {
  invInApi.queryByWhere(req, res)
})

router.get('/queryBy2Where', function (req, res) {
  invInApi.queryBy2Where(req, res)
})

router.get('/queryByWhereBetween', function (req, res) {
  invInApi.queryByWhereBetween(req, res)
})

router.get('/queryJoin2Table', function (req, res) {
  invInApi.queryJoin2Table(req, res)
})

router.get('/query2Table', function (req, res) {
  invInApi.query2Table(req, res)
})

router.get('/query2TableByWhere', function (req, res) {
  invInApi.query2TableByWhere(req, res)
})

router.get('/query2TableByBetween', function (req, res) {
  invInApi.query2TableByBetween(req, res)
})

router.get('/query2TableBy2Where', function (req, res) {
  invInApi.query2TableBy2Where(req, res)
})

router.get('/query2TableByWhereBetween', function (req, res) {
  invInApi.query2TableByWhereBetween(req, res)
})

router.get('/query2TableBy3Where', function (req, res) {
  invInApi.query2TableBy3Where(req, res)
})

router.get('/query2TableBy2WhereBetween', function (req, res) {
  invInApi.query2TableBy2WhereBetween(req, res)
})

router.get('/deleteData', function (req, res) {
  invInApi.deleteData(req, res)
})

router.get('/queryFormA331', function (req, res) {
  invInApi.queryFormA331(req, res)
})

router.get('/queryFormA341', function (req, res) {
  invInApi.queryFormA341(req, res)
})

router.get('/queryFormA556', function (req, res) {
  invInApi.queryFormA556(req, res)
})

router.post('/updateDataWhere', function (req, res) {
  invInApi.updateDataWhere(req, res)
})

router.post('/updateData2Where', function (req, res) {
  invInApi.updateData2Where(req, res)
})

router.post('/updateData3Where', function (req, res) {
  invInApi.updateData3Where(req, res)
})

router.post('/update3Data3Where', function (req, res) {
  invInApi.update3Data3Where(req, res)
})

router.post('/insertData', function (req, res) {
  invInApi.insertData(req, res)
})

router.get('/test', function (req, res) {
  invInApi.test(req, res)
})

// router.get('/logout', function(req, res, next) {
//     req.session.user =null;
//     res.json({code:0})
// });

module.exports = router
