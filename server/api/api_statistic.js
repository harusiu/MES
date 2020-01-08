//
// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db_ft')
var $utils = require('./utils')
// var $sql = require('./invInSqlMapping')

// 使用接連池，提升性能
//var pool = mysql.createPool($utils.extend({}, $conf.mysql))
var pool = mysql.createPool($utils.extend({multipleStatements: true}, $conf.mysql))//Mingzoo, 20191119

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
  /*queryBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT `schedule`,`modify_id`,`modify_date` FROM `fortop`.`schedule_list` WHERE `modify_date` >= ? AND `modify_date` <= ?'
    var inserts = [param.column, param.end]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },*/
  


  getOverallGoodRatio: function (req, res) {
    var sql = 'SELECT SUM(target_qty) AS target_qty, SUM(acc_good) AS acc_good, SUM(acc_ng) AS acc_ng, \
                CONCAT((SUM(acc_good)/(SUM(acc_good)+SUM(acc_ng)))*100, \'%\') AS good_ratio FROM job_status';
    //sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },
  
  getGoodRatio: function (req, res) {
    var param = req.query;
    var values = [param.job_type];
    var sql = 'SELECT * FROM job_status WHERE job_type=?';
    sql = mysql.format(sql, values);
    actionDB(pool, sql, res)
  },
  
  generalQuery: function (req, res) {
    var param = req.query;
    var sql = param.sql;
    //sql = mysql.format(sql)
    console.log(sql);
    actionDB(pool, sql, res);
    //console.log(res);
  },

}
