// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db_hr')
var $utils = require('./utils')

// 使用接連池，提升性能
//var pool = mysql.createPool($utils.extend({}, $conf.mysql))
var pool = mysql.createPool($utils.extend({multipleStatements: true}, $conf.mysql))

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
  /*
  DoOperationLog: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `staff_log` ('
    sql += '`staff_no`,`op_no`,`join_date`,`note`) VALUES('
    sql += '?,?,?,?)'

    var inserts = [param.staff_no, param.op_no, param.join_date, param.note]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },
  */

  generalQuery: function (req, res) {
    var param = req.query;
    var sql = param.sql;
    actionDB(pool, sql, res);
  },
}
