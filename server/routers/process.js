var express = require('express')
var router = express.Router()

var api = require('../api/api_process')

// router.get('/truncateTable', function (req, res) {
//     api.truncateTable(req, res)
// })

router.get('/queryAll', function (req, res) {
    api.queryAll(req, res)
})

router.get('/queryByWhere', function (req, res) {
    api.queryByWhere(req, res)
})

router.get('/queryOrder', function (req, res) {
    api.queryOrder(req, res)
})

router.get('/queryWorkList', function (req, res) {
    api.queryWorkList(req, res)
})

router.get('/queryProductDetail', function (req, res) {
    api.queryProductDetail(req, res)
})

//-----------------------------------------------------------------------
//   製程資料操作
//-----------------------------------------------------------------------
router.get('/getProcessClass', function (req, res) {
    api.getProcessClass(req, res)
})

router.post('/insertProcessData', function (req, res) {
    api.insertProcessData(req, res)
})

router.get('/checkProductId', function (req, res) {
    api.checkProductId(req, res)
})

router.post('/insertupdateDataByWhere', function (req, res) {
    api.insertupdateDataByWhere(req, res)
})

router.get('/deleteDataByWhere', function (req, res) {
    api.deleteDataByWhere(req, res)
})

module.exports = router
