//
// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db')
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
  // 查詢某資料表中的某些欄位資料
  queryAll: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ??'
    var inserts = [param.columns, param.table]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某些欄位資料，根據一組WHERE條件
  // $sql.queryByWhere: 'SELECT ?? FROM ?? WHERE ??=?'
  queryByWhere: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    var inserts = [param.columns, param.table, param.column, param.condition]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
    // pool.getConnection(function (err, connection) {
    //   if (err) throw err
    //   // connection.query($sql.queryByWhere, [columns, table, column, condition], function (err, result) {
    //   connection.query(sql, function (err, result) {
    //     if (err) throw err
    //     jsonWrite(res, result)
    //     // release the connection
    //     connection.release()
    //   })
    // })
  },

  // 查詢某資料表中的某些欄位資料，根據兩組WHERE條件
  queryBy2Where: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.columns, param.table, param.column1, param.condition1, param.column2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某些欄位資料，根據一組WHERE與BETWEEN條件
  queryByWhereBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? BETWEEN ? AND ?'
    var inserts = [param.columns, param.table, param.column1, param.condition1, param.column2, param.between1, param.between2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位
  queryJoin2Table: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? JOIN ?? ON ?? = ??'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2Table: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ??'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以一個WHERE條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableByWhere: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以一個WHERE-BETWEEN條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableByBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? BETWEEN ? AND ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.between1, param.between2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以兩個WHERE條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableBy2Where: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1, param.table1_col2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以一個WHERE條件以及WHERE BETWEEN條件查詢: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableByWhereBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? BETWEEN ? AND ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1, param.table1_col2, param.between1, param.between2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以三個WHERE條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableBy3Where: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ? AND ?? = ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1, param.table1_col2, param.condition2, param.table1_col3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以兩個WHERE條件以及WHERE BETWEEN條件查詢: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  query2TableBy2WhereBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ? AND ?? BETWEEN ? AND ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1, param.table1_col2, param.condition2, param.table1_col3, param.between1, param.between2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },
  
  // 根據輸入的參數查詢採購單A331表單
  queryFormA331: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? '
    var inserts = [param.columns, param.table]

    if(param.formClass) {
      sql += 'WHERE ?? = ? '
      inserts.push('TC001', param.formClass)
    }
    if(param.formNum) {
      sql += 'AND ?? LIKE ? '
      let str = '%' + param.formNum + '%'
      inserts.push('TC002', str)
    }
    if(param.purVendor) {
      sql += 'AND ?? = ? '
      inserts.push('TC004', param.purVendor)
    }
    if(param.formDate) {
      let date = param.formDate
      // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
      let strs = date.split(' ', 3)
      if (strs.length === 3) {
        sql += 'AND ?? BETWEEN ? AND ? '
        inserts.push('TC024', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
      }
    }
    if(param.purDate) {
      let date = param.purDate
        // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
        let strs = date.split(' ', 3)
        if (strs.length === 3) {
          sql += 'AND ?? BETWEEN ? AND ? '
          inserts.push('TC003', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
        }
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },  

  // 根據輸入的參數查詢進貨單A341表單，因為還要列出單身的驗收日期，所以要結合兩張表單的查詢
  queryFormA341: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? '
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col]

    if(param.formClass) {
      sql += 'WHERE ?? = ? '
      inserts.push('TG001', param.formClass)
    }
    if(param.formNum) {
      sql += 'AND ?? LIKE ?'
      let str = '%' + param.formNum + '%'
      inserts.push('TG002', str)
    }
    if(param.formVendor) {
      sql += 'AND ?? = ?'
      inserts.push('TG005', param.formVendor)
    }
    if(param.formDate) {
      let date = param.formDate
      // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
      let strs = date.split(' ', 3)
      if (strs.length === 3) {
        sql += 'AND ?? BETWEEN ? AND ? '
        inserts.push('TG014', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
      }
    }
    if(param.dueDate) {
      let date = param.dueDate
        // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
        let strs = date.split(' ', 3)
        if (strs.length === 3) {
          sql += 'AND ?? BETWEEN ? AND ? '
          inserts.push('TG003', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
        }
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)

  },

  // 根據輸入的參數查詢採購單A556表單
  queryFormA556: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? '
    var inserts = [param.columns, param.table]

    if(param.formClass) {
      sql += 'WHERE ?? = ? '
      inserts.push('TC001', param.formClass)
    }
    if(param.formNum) {
      sql += 'AND ?? LIKE ? '
      let str = '%' + param.formNum + '%'
      inserts.push('TC002', str)
    }
    if(param.factoryNo) {
      sql += 'AND ?? = ? '
      inserts.push('TC004', param.factoryNo)
    }
    if(param.formDate) {
      let date = param.formDate
      // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
      let strs = date.split(' ', 3)
      if (strs.length === 3) {
        sql += 'AND ?? BETWEEN ? AND ? '
        inserts.push('TC014', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
      }
    }
    if(param.pickDate) {
      let date = param.pickDate
        // date格式如2018-07-26 to 2018-07-28，split後'2018-07-26', 'to', '2018-07-28'
        let strs = date.split(' ', 3)
        if (strs.length === 3) {
          sql += 'AND ?? BETWEEN ? AND ? '
          inserts.push('TC003', $utils.datetoData(strs[0]), $utils.datetoData(strs[2]))
        }
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  }, 

  // 更新某資料表中的某個欄位資料，根據一組WHERE條件
  updateDataWhere: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料，根據二組WHERE條件
  updateData2Where: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1, param.column2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料，根據三組WHERE條件
  updateData3Where: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1,
      param.column2, param.condition2, param.column3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的3個欄位資料，根據3組WHERE條件
  update3Data3Where: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?'
    var inserts = [param.table, param.colset1, param.data1, param.colset2, param.data2, param.colset3, param.data3,
      param.column1, param.condition1, param.column2, param.condition2, param.column3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增5組欄位資料於某資料表中
  insertData: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?)'
    var inserts = [param.table, param.columns[0], param.columns[1], param.columns[2], param.columns[3], param.columns[4],
      param.values[0], param.values[1], param.values[2], param.values[3], param.values[4]]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 刪除某筆資料，根據2組WHERE條件
  deleteData: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM ?? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.table, param.column1, param.condition1, param.column2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 測試
  test: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? < ? AND ?? = Null'
    // var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.table1_val1, param.table2_col1]
    var sql = 'SELECT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? < ? AND ?? IS Null'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.table1_val1, param.table2_col1]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }
}
