var express = require('express')
var router = express.Router()

var api = require('../api/api_qualityresume')

// router.get('/truncateTable', function (req, res) {
//     api.truncateTable(req, res)
// })

/*router.get('/queryAll', function (req, res) {
    api.queryAll(req, res)
})

router.get('/queryByWhere', function (req, res) {
    api.queryByWhere(req, res)
})

router.get('/getColumnItems', function (req, res) {
  api.getColumnItems(req, res)
})*/
//-----------------------------------------------------------------------
//   品質管理點資料操作
//-----------------------------------------------------------------------
router.post('/uploadCheckPointFiles', function (req, res) {
  api.uploadCheckPointFiles(req, res)
})
router.get('/getCheckPointFilePath', function (req, res) {
  api.getCheckPointFilePath(req, res)
})
router.get('/getCheckPointFile', function (req, res) {
  api.getCheckPointFile(req, res)
})
//-----------------------------------------------------------------------
//   出貨成績書資料操作
//-----------------------------------------------------------------------
router.post('/uploadQualityCheckResultFiles', function (req, res) {
  api.uploadQualityCheckResultFiles(req, res)
})
//-----------------------------------------------------------------------
//   換線手順書資料操作
//-----------------------------------------------------------------------
router.post('/uploadLineChangeProcedureFiles', function (req, res) {
  api.uploadLineChangeProcedureFiles(req, res)
})
//-----------------------------------------------------------------------
//   管制計劃書資料操作
//-----------------------------------------------------------------------
router.post('/uploadControlProposalFiles', function (req, res) {
  api.uploadControlProposalFiles(req, res)
})
//-----------------------------------------------------------------------
//   包裝指示書資料操作
//-----------------------------------------------------------------------
router.post('/uploadPackingInstructionFiles', function (req, res) {
  api.uploadPackingInstructionFiles(req, res)
})
//-----------------------------------------------------------------------
//   零件位置圖資料操作
//-----------------------------------------------------------------------
router.post('/uploadComponentMapFiles', function (req, res) {
  api.uploadComponentMapFiles(req, res)
})
/*
router.get('/getOneQualityResumePoint', function (req, res) {
  api.getOneQualityResumePoint(req, res)
})

router.post('/uploadFile', function (req, res) {
  api.uploadFile(req, res)
})

router.get('/getFilePath', function (req, res) {
  api.getFilePath(req, res)
})

router.get('/getImage', function (req, res) {
  api.getImage(req, res)
})*/

module.exports = router