//
// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db_ft')
var $utils = require('./utils')
// var $sql = require('./invInSqlMapping')

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
  // 查詢某資料表中的某些欄位資料，介於條件之間
  queryBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT `schedule`,`modify_id`,`modify_date` FROM `fortop`.`schedule_list` WHERE `modify_date` >= ? AND `modify_date` <= ?'
    var inserts = [param.column, param.end]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },
  
  // 查詢某資料表中的最新一筆欄位資料
  queryLatest: function (req, res) {
    var sql = 'SELECT `schedule`,`ca1`,`modify_id`,`modify_date` FROM `fortop`.`schedule_list` ORDER BY `modify_date` DESC LIMIT 1'
    
    actionDB(pool, sql, res)
  },

  //-----------------------------------------------------------------------
  // 製程資料操作
  //-----------------------------------------------------------------------

  // 更新1個row的資料
  updateByWhere: function (req, res) {
    //var param = req.query
    //console.log(req)
    var param = req.body.data
    //console.log(param)
    //console.log(param.schedule)
    console.log(param.modifyid)
    console.log(param.modifyDate)
    console.log(param.originaldate)
    var sql = 'UPDATE `fortop`.`schedule_list` SET `schedule` = ?,`modify_id` = ?,`modify_date` = ? WHERE `modify_date` = ?'
    //var inserts = [param.schedule, param.modifyid, param.modifydate, param.originaldate]
    var inserts = [param.schedule, param.modifyid, param.modifyDate, param.originaldate]
    sql = mysql.format(sql, inserts)
    // console.log(sql)
  
    actionDB(pool, sql, res)
  },
  
  // 刪除某筆資料，根據一組WHERE條件
  deleteByWhere: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `fortop`.`schedule_list` WHERE `modify_date` = ?'
    var inserts = [param.modifydate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }
}