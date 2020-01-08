var express = require('express')
var router = express.Router()

var api = require('../api/api_mold')

// router.get('/truncateTable', function (req, res) {
//     api.truncateTable(req, res)
// })

router.get('/queryAll', function (req, res) {
    api.queryAll(req, res)
})

router.get('/queryByWhere', function (req, res) {
    api.queryByWhere(req, res)
})

router.get('/getColumnItems', function (req, res) {
  api.getColumnItems(req, res)
})

//-----------------------------------------------------------------------
//   模具資料操作
//-----------------------------------------------------------------------
router.get('/searchMold', function (req, res) {
  api.searchMold(req, res)
})

router.get('/getAllTerm', function (req, res) {
  api.getAllTerm(req, res)
})

router.get('/getMoldModelItems', function (req, res) {
  api.getMoldModelItems(req, res)
})

router.get('/getTermModelItems', function (req, res) {
  api.getTermModelItems(req, res)
})

router.get('/getMoldIdItems', function (req, res) {
  api.getMoldIdItems(req, res)
})

router.get('/getVendorItems', function (req, res) {
  api.getVendorItems(req, res)
})

router.get('/getPersonItems', function (req, res) {
  api.getPersonItems(req, res)
})

router.get('/getLineIdItems', function (req, res) {
  api.getLineIdItems(req, res)
})

router.get('/checkMold', function (req, res) {
  api.checkMold(req, res)
})

router.get('/checkOthersMoldId', function (req, res) {
  api.checkOthersMoldId(req, res)
})

router.post('/insertUpdateMoldInfo', function (req, res) {
  api.insertUpdateMoldInfo(req, res)
})

router.post('/insertMold', function (req, res) {
  api.insertMold(req, res)
})

router.post('/updateMold', function (req, res) {
  api.updateMold(req, res)
})

router.get('/deleteMoldInfo', function (req, res) {
  api.deleteMoldInfo(req, res)
})

//-----------------------------------------------------------------------
// 模片資料操作
//-----------------------------------------------------------------------
router.get('/getAllTemplet', function (req, res) {
  api.getAllTemplet(req, res)
})

router.get('/searchTemp', function (req, res) {
  api.searchTemp(req, res)
})

router.get('/getOptionsTempModel', function (req, res) {
  api.getOptionsTempModel(req, res)
})

router.get('/getOptionsTempVendor', function (req, res) {
  api.getOptionsTempVendor(req, res)
})

router.get('/getOptionsMoldModel', function (req, res) {
  api.getOptionsMoldModel(req, res)
})

router.get('/getOptionsTermModel', function (req, res) {
  api.getOptionsTermModel(req, res)
})

router.get('/getAllVendor', function (req, res) {
  api.getAllVendor(req, res)
})

router.get('/getAllTermModel', function (req, res) {
  api.getAllTermModel(req, res)
})

router.get('/getTempStock', function (req, res) {
  api.getTempStock(req, res)
})

router.get('/getTempModels', function (req, res) {
  api.getTempModels(req, res)
})

router.get('/getTempInfo', function (req, res) {
  api.getTempInfo(req, res)
})

router.get('/checkTemp', function (req, res) {
  api.checkTemp(req, res)
})

router.post('/insertTemp', function (req, res) {
  api.insertTemp(req, res)
})

router.get('/deleteTemp', function (req, res) {
  api.deleteTemp(req, res)
})

router.post('/updateTemp', function (req, res) {
  api.updateTemp(req, res)
})

router.post('/insertTempInv', function (req, res) {
  api.insertTempInv(req, res)
})

router.post('/tempStockIn', function (req, res) {
  api.tempStockIn(req, res)
})

router.post('/tempStockOut', function (req, res) {
  api.tempStockOut(req, res)
})

router.get('/getTempStockRecord', function (req, res) {
  api.getTempStockRecord(req, res)
})

router.get('/getTempStockIO', function (req, res) {
  api.getTempStockIO(req, res)
})

router.get('/getTempStockRemark', function (req, res) {
  api.getTempStockRemark(req, res)
})
//-----------------------------------------------------------------------
//   金相資料操作
//-----------------------------------------------------------------------
router.get('/searchMeta', function (req, res) {
  api.searchMeta(req, res)
})

router.get('/getOneMeta', function (req, res) {
  api.getOneMeta(req, res)
})

router.post('/addMeta', function (req, res) {
  api.addMeta(req, res)
})

router.get('/deleteMeta', function (req, res) {
  api.deleteMeta(req, res)
})

router.post('/updateMeta', function (req, res) {
  api.updateMeta(req, res)
})

router.get('/getAllWireSpec', function (req, res) {
  api.getAllWireSpec(req, res)
})

router.get('/getWireArea', function (req, res) {
  api.getWireArea(req, res)
})

router.post('/addWire', function (req, res) {
  api.addWire(req, res)
})

router.post('/uploadImage', function (req, res) {
  api.uploadImage(req, res)
})

router.get('/getFilePath', function (req, res) {
  api.getFilePath(req, res)
})

router.get('/getImage', function (req, res) {
  api.getImage(req, res)
})

router.get('/deleteDirFiles', function (req, res) {
  api.deleteDirFiles(req, res)
})

router.get('/deleteFile', function (req, res) {
  api.deleteFile(req, res)
})

router.get('/deleteFiles', function (req, res) {
  api.deleteFiles(req, res)
})

router.get('/deleteDir', function (req, res) {
  api.deleteDir(req, res)
})

router.get('/DoOperationLog', function (req, res) {
  api.DoOperationLog(req, res)
})


module.exports = router
