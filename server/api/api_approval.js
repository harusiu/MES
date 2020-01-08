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
  // *****************************************************************************
  //                          簽核表單類別操作
  // *****************************************************************************
  
  //========================
  // 新增簽核類別
  //========================
  insertApprClass: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `appr_class` (`class`, `name`, `step_num`, `comments`, `flow`, `modify_id`, `modify_date`) '
    sql += 'VALUES(?,?,?,?,?,?,?)'
    var inserts = [param.class, param.name, param.step_num, param.comments, param.flow, param.modify_id, param.modify_date]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //========================
  // 查詢簽核類別
  //========================
  getApprClass: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `appr_class` '
    sql += 'WHERE `class` = ?'
    var inserts = [param.class]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // *****************************************************************************
  //                          人員資料表操作
  // *****************************************************************************

  //========================
  // 查詢簽核類別
  //========================
  getPersons: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `staff_info` '
    sql += 'WHERE `department` = ? AND `title` = ?'
    var inserts = [param.department, param.title]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // *****************************************************************************
  //                          簽核表單操作
  // *****************************************************************************

  //========================
  // 取得表單流水號
  //========================
  getSeq: function (req, res) {
    var d = new Date()
    var year = d.getFullYear() - 1911   // 從西元年轉換到民國年
    var month = d.getMonth() + 1
    var date = d.getDate()
    
    var str1 = year + 
              (month < 10 ? '0' : '') + month + 
              (date < 10 ? '0' : '') + date
    var str2 = str1 + '%'

    var sql = 'SELECT MAX(`seq_no`) AS data FROM `appr_seq` WHERE `seq_no` LIKE ?'
    var inserts = [str2]
    sql = mysql.format(sql, inserts)
    
    pool.getConnection(function (err, connection) {
      if (err) throw err
      connection.query(sql, function (err, result) {
        if (err) throw err

        var maxId = result[0].data   // 今天表單流水號最大者
        var newId = (maxId==null) ? Number(str1+'0001') : Number(maxId)+1  // 若無則從0001開始編；若有則+1
      
        sql = 'INSERT INTO `appr_seq` (`seq_no`) VALUES (?)'
        inserts = [newId]
        sql = mysql.format(sql, inserts)
        connection.query(sql, function(err, result) {
          if(err) throw err
          res.json({seq_no: newId})
          // console.log('result = ', result.affectedRows)
        })
        
        // release the connection
        connection.release()
      })
    })
  },

  //========================
  // 新增簽核表單
  //========================
  insertApprForm: function (req, res) {
    var param = req.body.data

    var sql = 'INSERT INTO `appr_form` (`id`, `class`, `applicant`, `submit_time`, `step`) '
    sql += 'VALUES (?, ?, ?, ?, ?)'
    var inserts = [param.id, param.class, param.applicant, param.subit_time, param.step]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }

}
