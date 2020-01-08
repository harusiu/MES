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
//   取得所有品號
//-----------------------------------------------------------------------
router.get('/getAllProductId', function (req, res) {
  api.getAllProductId(req, res)
})
//-----------------------------------------------------------------------
//   品質管理點資料操作
//-----------------------------------------------------------------------
router.post('/uploadCheckPointFiles', function (req, res) {
  api.uploadCheckPointFiles(req, res)
})
router.get('/getFilePath', function (req, res) {
  api.getFilePath(req, res)
})
router.get('/getFile', function (req, res) {
  api.getFile(req, res)
})
router.get('/deleteFile', function (req, res) {
  api.deleteFile(req, res)
})
//-----------------------------------------------------------------------
//   出貨成績書資料上傳
//-----------------------------------------------------------------------
router.post('/uploadQualityCheckResultFiles', function (req, res) {
  api.uploadQualityCheckResultFiles(req, res)
})
//-----------------------------------------------------------------------
//   換線手順書資料上傳
//-----------------------------------------------------------------------
router.post('/uploadLineChangeProcedureFiles', function (req, res) {
  api.uploadLineChangeProcedureFiles(req, res)
})
//-----------------------------------------------------------------------
//   管制計劃書資料上傳
//-----------------------------------------------------------------------
router.post('/uploadControlProposalFiles', function (req, res) {
  api.uploadControlProposalFiles(req, res)
})
//-----------------------------------------------------------------------
//   包裝指示書資料上傳
//-----------------------------------------------------------------------
router.post('/uploadPackingInstructionFiles', function (req, res) {
  api.uploadPackingInstructionFiles(req, res)
})
//-----------------------------------------------------------------------
//   零件位置圖資料上傳
//-----------------------------------------------------------------------
router.post('/uploadComponentMapFiles', function (req, res) {
  api.uploadComponentMapFiles(req, res)
})

module.exports = router