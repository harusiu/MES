var express = require('express')
var router = express.Router()

var api = require('../api/api_approval')

// *****************************************************************************
//                          簽核表單類別操作
// *****************************************************************************
router.post('/insertApprClass', function (req, res) {
  api.insertApprClass(req, res)
})

router.get('/getApprClass', function (req, res) {
  api.getApprClass(req, res)
})

// *****************************************************************************
//                          人員資料表操作
// *****************************************************************************
router.get('/getPersons', function (req, res) {
  api.getPersons(req, res)
})

// *****************************************************************************
//                          簽核表單操作
// *****************************************************************************
router.get('/getSeq', function (req, res) {
  api.getSeq(req, res)
})

router.post('/insertApprForm', function (req, res) {
  api.insertApprForm(req, res)
})


module.exports = router
