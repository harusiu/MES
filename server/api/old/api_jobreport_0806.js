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


  // 更新1個row的資料
  updateByKey: function (req, res) {
    var param = req.body.data
    console.log(param)
    var sql = 'UPDATE `fortop`.?? SET ?? = ?  WHERE ?? = ?'
    //var inserts = [param.schedule, param.modifyid, param.modifydate, param.originaldate]
    var inserts = [param.table, param.key1, param.key1value, param.key2, param.key2value]
    sql = mysql.format(sql, inserts)
    console.log(sql)
  
    actionDB(pool, sql, res)
  },
  updateByWhere: function (req, res) {
    var param = req.body.data
    console.log(param)
    var sql = 'UPDATE `fortop`.`job_report` SET `work_id` = ?,`info` = ?,`status` = ?,`work_user` = ? ,`work_num` = ? WHERE `work_id` = ?'
    //var inserts = [param.schedule, param.modifyid, param.modifydate, param.originaldate]
    var inserts = [param.work_id, param.info, param.status, param.work_user, param.work_num, param.work_id]
    sql = mysql.format(sql, inserts)
    console.log(sql)
  
    actionDB(pool, sql, res)
  },
  queryByWhere: function (req, res) {
    
    var param = req.body.data
    //console.log(req.body.data)
    var sql = 'SELECT * FROM `fortop`.`job_report` WHERE `work_id` = ?'
    var inserts = [param.work_id]
    sql = mysql.format(sql, inserts)
    //console.log(sql)
    actionDB(pool, sql, res)
    //console.log(res.data)
  },
  insert_into: function (req, res) {
    var param = req.body.data
    //console.log(req.body.data)
    //console.log(res)
    var sql = 'INSERT INTO `job_report` ('
    sql += '`work_id`,`info`,`status`,`work_user`) VALUES('
    sql += '?,?,?,?)'

    var inserts = [param.work_id, param.info, param.status, param.work_user]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  }
}