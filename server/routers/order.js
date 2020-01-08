var express = require('express')
var router = express.Router()

var api = require('../api/api_order')

router.post('/insertOrderDone', function (req, res) {
    api.insertOrderDone(req, res)
})

module.exports = router
