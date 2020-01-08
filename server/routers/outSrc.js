var express = require('express')
var router = express.Router()

var outsrcAPI = require('../api/outsrcAPI')

router.get('/queryAll', function (req, res) {
  outsrcAPI.queryAll(req, res)
})

router.get('/queryOutsrc', function (req, res) {
  outsrcAPI.queryOutsrc(req, res)
})

router.get('/queryOverdueOuter', function (req, res) {
  outsrcAPI.queryOverdueOuter(req, res)
})

router.get('/queryWeekOuter', function (req, res) {
  outsrcAPI.queryWeekOuter(req, res)
})

router.get('/queryOverdueHoShun', function (req, res) {
  outsrcAPI.queryOverdueHoShun(req, res)
})

router.get('/queryWeekHoShun', function (req, res) {
  outsrcAPI.queryWeekHoShun(req, res)
})

router.get('/queryOverdueO', function (req, res) {
  outsrcAPI.queryOverdueO(req, res)
})

router.get('/queryWeekO', function (req, res) {
  outsrcAPI.queryWeekO(req, res)
})

router.get('/queryOverdueH', function (req, res) {
  outsrcAPI.queryOverdueH(req, res)
})

router.get('/queryWeekH', function (req, res) {
  outsrcAPI.queryWeekH(req, res)
})

router.get('/queryTYC', function (req, res) {
  outsrcAPI.queryTYC(req, res)
})

router.get('/getOverdueOuterItems', function (req, res) {
  outsrcAPI.getOverdueOuterItems(req, res)
})

router.get('/getWeekOuterItems', function (req, res) {
  outsrcAPI.getWeekOuterItems(req, res)
})

router.get('/getOverdueHoShunItems', function (req, res) {
  outsrcAPI.getOverdueHoShunItems(req, res)
})

router.get('/getWeekHoShunItems', function (req, res) {
  outsrcAPI.getWeekHoShunItems(req, res)
})

router.get('/getAverage', function (req, res) {
  outsrcAPI.getAverage(req, res)
})

router.get('/getPerformance', function (req, res) {
  outsrcAPI.getPerformance(req, res)
})

router.get('/getLastDate', function (req, res) {
  outsrcAPI.getLastDate(req, res)
})

router.get('/getColumnItems', function (req, res) {
  outsrcAPI.getColumnItems(req, res)
})

router.get('/get2ColumnItems', function (req, res) {
  outsrcAPI.get2ColumnItems(req, res)
})

router.get('/getColumnItemsByWhere', function (req, res) {
  outsrcAPI.getColumnItemsByWhere(req, res)
})

router.get('/getColumnItemsBy2Like', function (req, res) {
  outsrcAPI.getColumnItemsBy2Like(req, res)
})

router.get('/getColumnItemsBy3Like', function (req, res) {
  outsrcAPI.getColumnItemsBy3Like(req, res)
})

router.get('/queryByWhere', function (req, res) {
  outsrcAPI.queryByWhere(req, res)
})

router.get('/queryBy2Where', function (req, res) {
  outsrcAPI.queryBy2Where(req, res)
})

router.get('/queryBy2Like', function (req, res) {
  outsrcAPI.queryBy2Like(req, res)
})

router.get('/queryBy3Like', function (req, res) {
  outsrcAPI.queryBy3Like(req, res)
})

router.get('/queryByWhereNull', function (req, res) {
  outsrcAPI.queryByWhereNull(req, res)
})

router.get('/queryJoin2Table', function (req, res) {
  outsrcAPI.queryJoin2Table(req, res)
})

router.get('/queryPurA341', function (req, res) {
  outsrcAPI.queryPurA341(req, res)
})

router.get('/queryPurA341_w1', function (req, res) {
  outsrcAPI.queryPurA341_w1(req, res)
})

router.get('/queryPurA341_w2', function (req, res) {
  outsrcAPI.queryPurA341_w2(req, res)
})

router.get('/deleteData', function (req, res) {
  outsrcAPI.deleteData(req, res)
})

router.post('/updateData', function (req, res) {
  outsrcAPI.updateData(req, res)
})

router.post('/updateDataByWhere', function (req, res) {
  outsrcAPI.updateDataByWhere(req, res)
})

router.post('/updateData2', function (req, res) {
  outsrcAPI.updateData2(req, res)
})

router.post('/updateData3', function (req, res) {
  outsrcAPI.updateData3(req, res)
})

router.post('/updateData3Where3', function (req, res) {
  outsrcAPI.updateData3Where3(req, res)
})

router.post('/insertOneData', function (req, res) {
  outsrcAPI.insertOneData(req, res)
})

router.post('/insertData', function (req, res) {
  outsrcAPI.insertData(req, res)
})

router.post('/insertRow', function (req, res) {
  outsrcAPI.insertRow(req, res)
})

router.post('/insertMultiRow', function (req, res) {
  outsrcAPI.insertMultiRow(req, res)
})

router.get('/truncateTable', function (req, res) {
  outsrcAPI.truncateTable(req, res)
})

router.post('/test', function (req, res) {
  outsrcAPI.test(req, res)
})

// ----------User-----------
router.post('/addUser', function (req, res) {
  outsrcAPI.addUser(req, res)
})

router.post('/deleteUser', function (req, res) {
  outsrcAPI.deleteUser(req, res)
})

router.post('/updateUser', function (req, res) {
  outsrcAPI.updateUser(req, res)
})

router.post('/updatePwd', function (req, res) {
  outsrcAPI.updatePwd(req, res)
})

router.get('/getUsers', function (req, res) {
  outsrcAPI.getUsers(req, res)
})

router.post('/checkAccount', function (req, res) {
  outsrcAPI.checkAccount(req, res)
})

router.post('/checkPassword', function (req, res) {
  outsrcAPI.checkPassword(req, res)
})

// ----------Principal-----------
router.post('/addPrincipal', function (req, res) {
  outsrcAPI.addPrincipal(req, res)
})

router.post('/addMultiPrincipals', function (req, res) {
  outsrcAPI.addMultiPrincipals(req, res)
})

router.post('/deletePrincipal', function (req, res) {
  outsrcAPI.deletePrincipal(req, res)
})

router.get('/getPrincipals', function (req, res) {
  outsrcAPI.getPrincipals(req, res)
})

// ----------Foundry-----------
router.post('/addFoundry', function (req, res) {
  outsrcAPI.addFoundry(req, res)
})

router.post('/deleteFoundry', function (req, res) {
  outsrcAPI.deleteFoundry(req, res)
})

router.get('/getFoundrys', function (req, res) {
  outsrcAPI.getFoundrys(req, res)
})

// ----------Foundry Item-----------
router.post('/addFoundryItem', function (req, res) {
  outsrcAPI.addFoundryItem(req, res)
})

router.post('/deleteFoundryItem', function (req, res) {
  outsrcAPI.deleteFoundryItem(req, res)
})

router.get('/getFoundryItems', function (req, res) {
  outsrcAPI.getFoundryItems(req, res)
})

//---------------------------------------------------
//                   個人績效統計
//---------------------------------------------------
router.post('/sumP1', function (req, res) {
  outsrcAPI.sumP1(req, res)
})

router.post('/sumP2', function (req, res) {
  outsrcAPI.sumP2(req, res)
})

router.post('/sumP3', function (req, res) {
  outsrcAPI.sumP3(req, res)
})

router.post('/sumP4', function (req, res) {
  outsrcAPI.sumP4(req, res)
})

router.post('/sumP5', function (req, res) {
  outsrcAPI.sumP5(req, res)
})

module.exports = router