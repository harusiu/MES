var express = require('express')
var router = express.Router()

var api = require('../api/api_human_resource')

router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.get('/generalQuery', function (req, res) {
  api.generalQuery(req, res)
})

module.exports = router
