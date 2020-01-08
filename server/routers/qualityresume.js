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
//   以品號取得製程資料
//-----------------------------------------------------------------------
router.get('/getProcessSpec', function(req, res){
  api.getProcessSpec(req, res)
})
//-----------------------------------------------------------------------
//   以品號、檢規序號取得端子品號、線材名稱
//-----------------------------------------------------------------------
router.get('/getWire', function(req, res){
  api.getWire(req, res)
})
//-----------------------------------------------------------------------
//   依管制工程取得管制重點
//-----------------------------------------------------------------------
router.get('/getControlTitle', function (req, res) {
  api.getControlTitle(req, res)
})
router.get('/getCutWireModuleControlTitle', function (req, res) {
  api.getCutWireModuleControlTitle(req, res)
})
//-----------------------------------------------------------------------
//   更新管制重點
//-----------------------------------------------------------------------
router.get('/addControlTitle', function(req, res){
  api.addControlTitle(req, res)
})
router.post('/upadteControlTitle', function(req, res){
  api.upadteControlTitle(req, res)
})
router.get('/deleteControlTitle', function(req, res){
  api.deleteControlTitle(req, res)
})
router.post('/insertControlTitleStandard', function(req, res){
  api.insertControlTitleStandard(req, res)
})
router.get('/getStandard', function(req, res){
  api.getStandard(req, res)
})
//-----------------------------------------------------------------------
//   裁線製程 - 以製令單別、品號、檢規序號、線材名稱取得最新的首中末資料 - 
//-----------------------------------------------------------------------
router.get('/getCutWirePeriodData', function(req, res){
  api.getCutWirePeriodData(req, res)
})
//-----------------------------------------------------------------------
//   裁線製程 - 儲存首中末資料到資料庫 - 
//-----------------------------------------------------------------------
router.post('/insertCutWireData', function(req, res){
  api.insertCutWireData(req, res)
})
//-----------------------------------------------------------------------
//   端子製程 - 以品號、檢規序號取得端子品號、線材名稱
//-----------------------------------------------------------------------
router.get('/getModule', function(req, res){
  api.getModule(req, res)
})
//-----------------------------------------------------------------------
//   端子製程 - 以端子品號取得前後足寬高、拔脫力標準值
//-----------------------------------------------------------------------
router.get('/getModuleStd', function(req, res){
  api.getModuleStd(req, res)
})
//-----------------------------------------------------------------------
//   端子製程 - 以線材名稱取得拔脫力標準值 (金相模組無相關端子品號)
//-----------------------------------------------------------------------
router.get('/getPullForceStd', function(req, res){
  api.getPullForceStd(req, res)
})
//-----------------------------------------------------------------------
//   端子製程 - 以製令單別、品號、檢規序號、線材名稱取得最新的首中末資料 - 
//-----------------------------------------------------------------------
router.get('/getModulePeriodData', function(req, res){
  api.getModulePeriodData(req, res)
})
//-----------------------------------------------------------------------
//   端子製程 - 儲存首中末資料到資料庫 - 
//-----------------------------------------------------------------------
router.post('/insertModuleData', function(req, res){
  api.insertModuleData(req, res)
})
router.get('/getPeriodData', function(req, res){
  api.getPeriodData(req, res)
})
//-----------------------------------------------------------------------
//   裁線端子製程 - 儲存首中末資料到資料庫 - 
//-----------------------------------------------------------------------
router.post('/insertPeriodData', function(req, res){
  api.insertPeriodData(req, res)
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
//   出貨成績書 - 取得檢規項目
//-----------------------------------------------------------------------
router.get('/getQualityInfo', function (req, res){
  api.getQualityInfo(req, res)
})
router.get('/getChangeRecord', function (req, res) {
  api.getChangeRecord(req, res)
})
router.get('/getShippingQuantity', function (req, res) {
  api.getShippingQuantity(req, res)
})
router.get('/getResultForm', function (req, res) {
  api.getResultForm(req, res)
})
router.get('/getSizeItem', function (req, res) {
  api.getSizeItem(req, res)
})
router.get('/getImage', function (req, res) {
  api.getImage(req, res)
})
//-----------------------------------------------------------------------
//   製作出貨成績書 (不含測量值)
//-----------------------------------------------------------------------
router.post('/insertResultForm', function(req, res){
  api.insertResultForm(req, res)
})
router.post('/insertChangeRecordData', function(req, res){
  api.insertChangeRecordData(req, res)
})
router.post('/insertSizeItem', function(req, res){
  api.insertSizeItem(req, res)
})
router.post('/saveImg', function(req, res){
  api.saveImg(req, res)
})
//-----------------------------------------------------------------------
//   儲存已完成之出貨成績書 
//-----------------------------------------------------------------------
router.post('/insertResultData', function(req, res){
  api.insertResultData(req, res)
})
router.post('/insertStandardExamData', function(req, res){
  api.insertStandardExamData(req, res)
})
router.post('/insertSizeExamData', function(req, res){
  api.insertSizeExamData(req, res)
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