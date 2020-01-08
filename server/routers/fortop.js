var express = require('express')
var router = express.Router()

var api = require('../api/api_fortop')


router.post('/DoOperationLog', function (req, res) {
  api.DoOperationLog(req, res)
})

module.exports = router