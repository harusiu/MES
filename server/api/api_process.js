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
  // 清除資料並保留結構、欄位、索引
  truncateTable: function (req, res) {
    var param = req.query
    var sql = 'TRUNCATE TABLE ??'
    var inserts = [param.table]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某些欄位資料
  queryAll: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ??'
    var inserts = [param.columns, param.table]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },
  
  // 查詢某資料表中的某些欄位資料，根據一組WHERE條件
  queryByWhere: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    var inserts = [param.columns, param.table, param.column, param.condition]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },


  queryOrder: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `mocta` WHERE `TA003`=?'
    
    var inserts = [param.date]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  queryWorkList: function (req, res) {
    var param = req.query
    var sql = 'SELECT `TA006`, SUM(`TA015`) FROM `mocta` WHERE `TA003`=? Group BY `TA006`'
    var inserts = [param.date]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  queryProductDetail: function (req, res) {
    var param = req.query
    var sql = 'SELECT `TA006`, SUM(`TA015`), `product_operate` FROM `mocta` JOIN `profile_management` ON ?? = ?? WHERE `TA006`=? Group BY `TA006`'
    var inserts = ['mocta.TA006', 'profile_management.product_id', param.productID]
    if(param.productID == null) //Mingzoo 20190919
    {
        res.end()
    }
    else
    {
        sql = mysql.format(sql, inserts)
        actionDB(pool, sql, res)
    }
  },

  
  //-----------------------------------------------------------------------
  // 製程資料操作
  //-----------------------------------------------------------------------
  // 查詢某個資料表中的某個欄位的不重複資料(/，並排序)
  getProcessClass: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ??'
    // var sql = 'SELECT DISTINCT ?? FROM ?? ORDER BY ??'
    var inserts = [param.column, param.table]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增1個row的資料
  insertProcessData: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? VALUES (?, ?)'
    var inserts = [param.table, param.product_id, JSON.stringify(param.process)]
    if(param.product_id == null || param.product_id.length <= 1)    //Mingzoo 20190919
    {
        res.end()
    }
    else
    {
        sql = mysql.format(sql, inserts)
        // console.log(sql)
        actionDB(pool, sql, res)
    }
  },

  // 查詢某資料表中的某些欄位資料，根據一組WHERE條件
  checkProductId: function (req, res) {
    var param = req.query
    // var sql = 'SELECT COUNT(*) FROM ?? WHERE ?? = ?'
    var sql = 'SELECT EXISTS(SELECT * FROM ?? WHERE ?? = ?) AS "isExists"'
    var inserts = [param.table, param.column, param.condition]
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 插入或更新某資料表中的欄位資料
  insertupdateDataByWhere: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? (??,??,??,??) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE ?? = VALUES(??), ?? = VALUES(??), ?? = VALUES(??)'
    var inserts = [param.table, param.columns[0], param.columns[1], param.columns[2], param.columns[3], 
                   param.values[0], param.values[1], param.values[2], param.values[3], param.columns[1], param.columns[1],
                   param.columns[2], param.columns[2], param.columns[3], param.columns[3]]
    if(param.values[0]==null || param.values[1]==null || param.values[2]==null || param.values[3]==null)
    { res.end() }
    else if(param.values[0].length<=1 || param.values[1].length<=1 || param.values[2].length<=1 || param.values[3].length<=1)
    { res.end() }
	else
	{
		sql = mysql.format(sql, inserts)
		actionDB(pool, sql, res)
	}
  },
  
  // 刪除某筆資料，根據一組WHERE條件
  deleteDataByWhere: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM ?? WHERE ?? = ?'
    var inserts = [param.table, param.column, param.condition]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }

}