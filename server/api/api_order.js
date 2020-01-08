// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db_ft')
var $utils = require('./utils')

// 使用接連池，提升性能
var pool = mysql.createPool($utils.extend({}, $conf.mysql))

// 向前台返回JSON方法的簡單封裝
var jsonWrite = function (res, ret) {
  if (typeof ret === 'undefined') {
    res.json({
      code: '1',
      msg: '操作失敗'
    })
  } else {
    res.json(ret)
  }
}

// 取得pool連線後執行sql指令，最後realease connection
var actionDB = function (pool, sql, res) {
  pool.getConnection(function (err, connection) {
    if (err) throw err
    connection.query(sql, function (err, result) {
      if (err) throw err
      jsonWrite(res, result)
      // release the connection
      connection.release()
    })
  })
}

module.exports = {

  insertOrderDone: function (req, res) {
    var param = req.body.data
    if (param.order_ids.length>0) {
      var sql = 'INSERT INTO order_done (order_id) VALUES ';//? ON DUPLICATE KEY UPDATE order_id=order_id;'
      for (var i=0; i<param.order_ids.length-1; i++)
      {
        sql = sql + "('" + param.order_ids[i] + "'), "
      }
      sql = sql + "('" + param.order_ids[param.order_ids.length-1] + "') "
      sql += 'ON DUPLICATE KEY UPDATE order_id=order_id;'
      //console.log(sql)
      actionDB(pool, sql, res)
    }
  }

}
