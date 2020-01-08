var express = require('express')
var router = express.Router()

var api = require('../api/api_statistic')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.get('/getOverallGoodRatio', function (req, res) {
  api.getOverallGoodRatio(req, res)
})

router.get('/getGoodRatio', function (req, res) {
  api.getGoodRatio(req, res)
})

router.get('/generalQuery', function (req, res) {
  api.generalQuery(req, res)
})



module.exports = router
