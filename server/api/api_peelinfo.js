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
  // 查詢某個資料表中的某個欄位的不重複資料，並排序
  getColumnItems: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ??'
    var sql = 'SELECT DISTINCT ?? FROM ?? ORDER BY ??'
    var inserts = [param.column, param.table, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //------------------------------------------------------------------------------------------
  // 設備的操作
  //------------------------------------------------------------------------------------------
  getAllEquipments: function(req, res) {
    var sql = 'SELECT * FROM `peel_info`'

    actionDB(pool, sql, res)
  },

  // 檢查端子品號配電線材質組合是否已存在
  checkId: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `peel_info` WHERE `module_no`="?" AND `part_no`="?"'
    var inserts = [param.equipId,param.person]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 以財產編號查詢設備
  getEquipment: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM peel_info WHERE `module_no` = ? AND `part_no` = ?'
    var inserts = [param.equipId,param.person]

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢設備
  queryEquipment: function (req, res) {
    var param = req.query
    var sql = 'SELECT *, DATE_FORMAT(`modify_date`, "%Y/%m/%d") AS `modify_date` FROM `peel_info` '
    var inserts = []
    var flag = false

    // 處理財產編號查詢
    if(param.equipId) {
      if(!flag) {
        sql += 'WHERE `module_no` = ? '
        flag = true
      } else {
        sql += 'AND `module_no` = ? '
      }
      inserts.push(param.equipId)
    }

    // 處理線別查詢
    if(param.line) {
      if(!flag) {
        sql += 'WHERE `length` = ? '
        flag = true
      } else {
        sql += 'AND `length` = ? '
      }
      inserts.push(param.line)
    }

    // 處理負責人查詢
    if(param.person) {
      if(!flag) {
        sql += 'WHERE `part_no` = ? '
        flag = true
      } else {
        sql += 'AND `part_no` = ? '
      }
      inserts.push(param.person)
    }

    // 處理類別查詢
    if(param.staff) {
      if(!flag) {
        sql += 'WHERE `modify_id` = ? '
        flag = true
      } else {
        sql += 'AND `modify_id` = ? '
      }
      inserts.push(param.class)
    }

    // 處理廠商查詢
    if(param.modifydate) {
      if(!flag) {
        sql += 'WHERE `modify_date` = ? '
        flag = true
      } else {
        sql += 'AND `modify_date` = ? '
      }
      inserts.push(param.modifydate)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 刪除一筆設備資料
  deleteEquipment: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `peel_info` WHERE `module_no` = ? AND `part_no` = ?'
    var inserts = [param.equipId,param.person]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------
  // 新增設備
  //----------------
  insertEquipment: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `peel_info` (`module_no`, `length`, `part_no`, '
    sql += '`modify_id`, `modify_date`)'
    sql += 'VALUES(?,?,?,?,?)'
    
    var inserts = [param.id, param.line, param.person, param.creator, param.createDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------
  // 更新設備
  //----------------
  updateEquipment: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `peel_info` SET `length`=?,'
    sql += '`modify_id`=?, `modify_date`=? '
    sql += 'WHERE `module_no`=? AND `part_no`=?'
    
    var inserts = [param.line, param.modifier, param.modiDate, param.id, param.person]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }

}
