//
// 實現與MySQL交互
var mysql = require('mysql')
var $conf = require('../data/db_outsrc')
var $utils = require('./utils')

var sha256 = require('js-sha256').sha256

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

  // 查詢某資料表中的某些欄位資料；以輸入的欄位與參數進行查詢
  queryOutsrc: function (req, res) {
    var param = req.query

    var sql = 'SELECT ?? FROM ?? '
    var inserts = [param.columns, param.table]

    // 查詢條件:客戶別(0、1、2開頭:外圍，3開頭:TYC/儒億，5開頭:協力廠，6開頭:內部)
    // if(param.Client) {
    //   if(param.Client==='外圍') {
    //       sql += 'WHERE (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ?)'
    //   } else {
    //       sql += 'WHERE ?? LIKE ?'
    //   }
      
    //   // 取得客戶代號欄位如'RC005'
    //   let col = param.col_Client
    //   // 判斷客戶別
    //   switch (param.Client) {
    //     case '外圍':
    //       // inserts.push('RC005', '[012]%')  // -->不能work，Why?
    //       inserts.push(col, '0%', col, '1%', col, '2%')
    //       break
    //     case 'TYC/儒億':
    //       inserts.push(col, '3%')
    //       break
    //     case '協力廠':
    //       inserts.push(col, '5%')
    //       break
    //     case '內部':
    //       inserts.push(col, '6%')
    //       break
    //   }
    // }

    // 查詢產品品號
    if(param.ProductId) {
      sql += 'WHERE ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    }
    
    // 查詢客戶代號
    if(param.arrClient !== undefined) {
      if(param.ProductId) {
        sql += 'AND ?? IN (?) '
      } else {
        sql += 'WHERE ?? IN (?) '
      }
      inserts.push(param.col_Client, param.arrClient)
    }
    
    

    // 查詢條件:外包負責人
    if(param.Principal) {
      if(param.ProductId || param.arrClient !== undefined) {
        sql += 'AND ?? = ? '
      } else {
        sql += 'WHERE ?? = ? '
      }
      inserts.push(param.col_Principal, param.Principal)
    }

    // 查詢條件:SFT承接線別
    // 若條件沒有選擇，param.arrSFT傳進來會是undefined
    if(param.arrSFT !== undefined) {
      if(param.ProductId || param.arrClient !== undefined || param.Principal) {
        sql += 'AND ?? IN (?) '
      } else {
        sql += 'WHERE ?? IN (?) '
      }
      inserts.push(param.col_SFT, param.arrSFT)
    }

    // 查詢條件:訂單
    if(param.Order) {
      if(param.ProductId || param.arrClient !== undefined || param.Principal || param.arrSFT !== undefined) {
        if(param.Order==='Y') {  // 有訂單
          sql += 'AND ?? = ? '
          inserts.push(param.col_Order, param.Order)
        } else {  // 無訂單
          sql += 'AND ?? IS NULL '
          inserts.push(param.col_Order)
        }
      } else {
        if(param.Order==='Y') {  // 有訂單
          sql += 'WHERE ?? = ? '
          inserts.push(param.col_Order, param.Order)
        } else {  // 無訂單
          sql += 'WHERE ?? IS NULL '
          inserts.push(param.col_Order)
        }
      } 
    }

    // 查詢條件:發放
    if(param.Assign==='N') {  // 尚未發放(條件: 發放日欄位為空)
      if(param.ProductId || param.arrClient !== undefined || param.Principal || param.arrSFT !== undefined || param.Order) {
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_AssignDate)
      } else {
        sql += 'WHERE ?? IS NULL '
        inserts.push(param.col_AssignDate)
      }
    }
    
    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      if(param.ProductId || param.arrClient !== undefined || param.Principal || param.arrSFT !== undefined || param.Order || param.Assign) {
        sql += 'AND ?? IN (?) '
      } else {
        sql += 'WHERE ?? IN (?) '
      }
      inserts.push(param.col_TYC, param.arrTYC)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-外圍
  // 逾期-外圍條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //             (2) 預計完工日與變更完工日小於今日日期
  queryOverdueOuter: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?)'
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2']
    
    sql = mysql.format(sql, inserts)
    // console.log(sql)
    actionDB(pool, sql, res)
  },

  // 查詢本週-外圍、下週-外圍
  // 本週-外圍(下週-外圍)條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  queryWeekOuter: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?)'
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2']
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-和順
  // 條件(1) 客戶代碼6 開頭為和順
  //     (2) 預計完工日與變更完工日小於今日日期
  queryOverdueHoShun: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ?)'
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '6%']
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢本週-和順、下週-和順
  // 本週-和順(下週-和順)條件(1) 客戶代碼6 開頭為和順
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  queryWeekHoShun: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ?)'
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '6%']
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-外圍
  // 逾期-外圍條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //             (2) 預計完工日與變更完工日小於今日日期
  // 在外圍逾期的單中，根據查詢條件(有無訂單、歐美、產品品號)搜尋
  queryOverdueO: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?) '
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2']
    
    // 查詢條件:訂單
    if(param.Order) {
      if(param.Order==='Y') {  // 有訂單
        sql += 'AND ?? = ? '
        inserts.push(param.col_Order, param.Order)
      } else {  // 無訂單
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_Order)
      }
    }
    
    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      sql += 'AND ?? IN (?) '
      inserts.push(param.col_TYC, param.arrTYC)
    }

    // 查詢條件:產品品號
    if(param.ProductId) {
      sql += 'AND ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    } 
    
    sql = mysql.format(sql, inserts)
    // console.log(sql)
    actionDB(pool, sql, res)
  },

  // 查詢本週-外圍、下週-外圍
  // 本週-外圍(下週-外圍)條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  // 在本(下)周-外圍的單中，根據查詢條件(有無訂單、歐美、產品品號)搜尋
  queryWeekO: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?) '
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2']

    // 查詢條件:訂單
    if(param.Order) {
      if(param.Order==='Y') {  // 有訂單
        sql += 'AND ?? = ? '
        inserts.push(param.col_Order, param.Order)
      } else {  // 無訂單
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_Order)
      }
    }
    
    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      sql += 'AND ?? IN (?) '
      inserts.push(param.col_TYC, param.arrTYC)
    }

    // 查詢條件:產品品號
    if(param.ProductId) {
      sql += 'AND ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    } 
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-和順
  // 條件(1) 客戶代碼6 開頭為和順
  //     (2) 預計完工日與變更完工日小於今日日期
  // 在逾期-和順的單中，根據查詢條件(有無訂單、歐美、產品品號)搜尋
  queryOverdueH: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ?) '
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '6%']

    // 查詢條件:訂單
    if(param.Order) {
      if(param.Order==='Y') {  // 有訂單
        sql += 'AND ?? = ? '
        inserts.push(param.col_Order, param.Order)
      } else {  // 無訂單
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_Order)
      }
    }
    
    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      sql += 'AND ?? IN (?) '
      inserts.push(param.col_TYC, param.arrTYC)
    }

    // 查詢條件:產品品號
    if(param.ProductId) {
      sql += 'AND ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    } 
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢本週-和順、下週-和順
  // 本週-和順(下週-和順)條件(1) 客戶代碼6 開頭為和順
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  // 在本(下)周-和順的單中，根據查詢條件(有無訂單、歐美、產品品號)搜尋
  queryWeekH: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ?) '
    var inserts = [param.columns, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '6%']
    
    // 查詢條件:訂單
    if(param.Order) {
      if(param.Order==='Y') {  // 有訂單
        sql += 'AND ?? = ? '
        inserts.push(param.col_Order, param.Order)
      } else {  // 無訂單
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_Order)
      }
    }
    
    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      sql += 'AND ?? IN (?) '
      inserts.push(param.col_TYC, param.arrTYC)
    }

    // 查詢條件:產品品號
    if(param.ProductId) {
      sql += 'AND ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    } 
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 本週歐美、下週歐美、單缺頁面，根據查詢條件(有無訂單、歐美、產品品號)的查詢
  queryTYC: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? LIKE ? '
    var inserts = [param.columns, param.table, param.column1, param.condition1]

    // 查詢條件:歐美(TYC專用)
    if(param.arrTYC !== undefined) {
      sql += 'AND ?? IN (?) '
      inserts.push(param.col_TYC, param.arrTYC)
    }

    // 查詢條件:訂單
    if(param.Order) {
      if(param.Order==='Y') {  // 有訂單
        sql += 'AND ?? = ? '
        inserts.push(param.col_Order, param.Order)
      } else {  // 無訂單
        sql += 'AND ?? IS NULL '
        inserts.push(param.col_Order)
      }
    }

    // 查詢條件:產品品號
    if(param.ProductId) {
      sql += 'AND ?? = ? '
      inserts.push(param.col_ProductId, param.ProductId)
    } 

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-外圍，不重複欄位項目
  // 逾期-外圍條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //             (2) 預計完工日與變更完工日小於今日日期
  getOverdueOuterItems: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?) ORDER BY ??'
    var inserts = [param.column, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2', param.column]
    
    sql = mysql.format(sql, inserts)
    // console.log(sql)
    actionDB(pool, sql, res)
  },

  // 查詢本週-外圍、下週-外圍，不重複欄位項目
  // 本週-外圍(下週-外圍)條件(1) 客戶代碼0,1,2,3004,3004-1,3004-2,5 開頭為外圍
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  getWeekOuterItems: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ?? LIKE ? OR ??=? OR ??=? OR ??=?) ORDER BY ??'
    var inserts = [param.column, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '0%', param.col_Client, '1%', param.col_Client, '2%',  param.col_Client, '5%',
      param.col_Client, '3004', param.col_Client, '3004-1', param.col_Client, '3004-2', param.column]
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢逾期-和順, 不重複欄位項目
  // 條件(1) 客戶代碼6 開頭為和順
  //     (2) 預計完工日與變更完工日小於今日日期
  getOverdueHoShunItems: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? from `outsrc` WHERE ??=? AND (??<? OR ??<?) AND (?? LIKE ?)  ORDER BY ??'
    var inserts = [param.column, param.col_SFT, param.SFT, param.col_ExpCompleted, param.date, 
      param.col_ModCompleted, param.date, param.col_Client, '6%', param.column]
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢本週-和順、下週-和順, 不重複欄位項目
  // 本週-和順(下週-和順)條件(1) 客戶代碼6 開頭為和順
  //                       (2) 預計完工日與變更完工日為當(下)周的日期
  // WEEK(date, mode): mode=3，Monday	1-53	with more than 3 days this year，星期從星期一開始
  getWeekHoShunItems: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? from `outsrc` WHERE ??=? AND (WEEK(??, 3)=? OR WEEK(??, 3)=?) AND (?? LIKE ?) ORDER BY ??'
    var inserts = [param.column, param.col_SFT, param.SFT, param.col_ExpCompleted, param.nWeek, 
      param.col_ModCompleted, param.nWeek, param.col_Client, '6%', param.column]
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 計算某個欄位在某條件下的平均值
  getAverage: function (req, res) {
    var param = req.query
    // var sql = 'SELECT AVG(??) FROM ?? WHERE ?? = ? AND ?? BETWEEN ? AND ?'
    // var inserts = [param.column, param.table, param.column1, param.condition1, param.column2, param.value1, param.value2]
    // var sql = 'SELECT `person`, AVG(`data2`) AS `avg2`, AVG(`data3`) AS `avg3`, AVG(`data4`) AS `avg4` FROM `performance` WHERE ?? = ? AND ?? BETWEEN ? AND ? GROUP BY `person`'
    // var inserts = [param.column1, param.condition1, param.column2, param.between1, param.between2]
    var sql = 'SELECT `person`, AVG(`data2`) AS `avg2`, AVG(`data3`) AS `avg3`, AVG(`data4`) AS `avg4` FROM `performance` WHERE ?? IN (?) AND ?? BETWEEN ? AND ? GROUP BY `person`'
    var inserts = [param.column1, param.condition1, param.column2, param.between1, param.between2]
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢績效資料
  getPerformance: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM `performance` WHERE `person` IN (?) AND `date` BETWEEN ? AND ?'
    var inserts = [param.columns, param.condition1, param.between1, param.between2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢最後日期
  getLastDate: function (req, res) {
    var param = req.query
    var sql = 'SELECT MAX(`date`) FROM ??'
    var inserts = [param.table]
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢某個資料表中的某個欄位的不重複資料，並排序
  getColumnItems: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ??'
    var sql = 'SELECT DISTINCT ?? FROM ?? ORDER BY ??'
    var inserts = [param.column, param.table, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某個資料表中的某2個欄位的不重複資料，Sort by column1
  get2ColumnItems: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ??'
    var sql = 'SELECT DISTINCT ??, ?? FROM ?? ORDER BY ??'
    var inserts = [param.column1, param.column2, param.table, param.column1]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某個資料表中的某個欄位的不重複資料，並且排序，在一個WHERE條件下
  getColumnItemsByWhere: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ?? WHERE ?? = ?'
    var sql = 'SELECT DISTINCT ?? FROM ?? WHERE ?? = ? ORDER BY ??'
    var inserts = [param.column, param.table, param.column1, param.condition1, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某個欄位的不重複資料，並且排序，根據2組LIKE條件
  getColumnItemsBy2Like: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? WHERE ?? LIKE ? AND ?? LIKE ? ORDER BY ??'
    var inserts = [param.column, param.table, param.column1, param.condition1, param.column2, param.condition2, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某個欄位的不重複資料，並且排序，根據3組LIKE條件
  getColumnItemsBy3Like: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? WHERE ?? LIKE ? AND (?? LIKE ? OR ?? LIKE ?) ORDER BY ??'
    var inserts = [param.column, param.table, param.column1, param.condition1, param.column2, param.condition2, param.column3, param.condition3, param.column]
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

  // 查詢某資料表中的某些欄位資料，根據2組LIKE條件
  queryBy2Like: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? LIKE ? AND ?? LIKE ?'
    var inserts = [param.columns, param.table, param.column1, param.condition1, param.column2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表中的某些欄位資料，根據3組LIKE條件(ps:其中兩組條件為聯集)
  queryBy3Like: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? LIKE ? AND (?? LIKE ? OR ?? LIKE ?)'
    var inserts = [param.columns, param.table, param.column1, param.condition1, param.column2, param.condition2, param.column3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢某資料表的某些欄位，根據一個Where條件以及一個欄位不為NULL
  queryByWhereNull: function (req, res) {
    var param = req.query
    var sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? IS NOT Null'
    var inserts = [param.columns, param.table, param.column1, param.condition1, param.column2]
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
  queryPurA341: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ??'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以一個WHERE條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  queryPurA341_w1: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢2個資料表中的某些欄位，以兩個WHERE條件: Using "DISTINCT" to discard rows that have a duplicate column value by using the DISTINCT keyword.
  queryPurA341_w2: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? JOIN ?? ON ?? = ?? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.columns, param.table1, param.table2, param.table1_col, param.table2_col, param.table1_col1, param.condition1, param.table1_col2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料
  updateData: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ?'
    var inserts = [param.table, param.column, param.value]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },
  
  // 更新某資料表中的某個欄位資料，根據一組WHERE條件
  updateDataByWhere: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1]
    sql = mysql.format(sql, inserts)

    // console.log(sql)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料，根據二組WHERE條件
  updateData2: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1, param.column2, param.condition2]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料，根據三組WHERE條件
  updateData3: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?'
    var inserts = [param.table, param.column, param.value, param.column1, param.condition1,
      param.column2, param.condition2, param.column3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新某資料表中的某個欄位資料，根據二組WHERE條件
  updateData3Where3: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ?, ?? = ?, ?? = ? WHERE ?? = ? AND ?? = ? AND ?? = ?'
    var inserts = [param.table, param.colset1, param.data1, param.colset2, param.data2, param.colset3, param.data3,
      param.column1, param.condition1, param.column2, param.condition2, param.column3, param.condition3]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增1組欄位資料於某資料表中
  insertOneData: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? (??) VALUES (?)'
    var inserts = [param.table, param.column, param.value]
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

  // 新增一整個row的資料
  insertRow: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? VALUES ?'
    // ex: INSERT INTO `outsrc` VALUES ('W18', '5/4', 'A511-10704190112', '11-B697SYN', 'TYC', 'Y', 'W31', '5/3', '300 ', '0', '300 ', '1', '3', '0', '5/2', '5/2', '5/3', '5/3', '6/19', '6/19', '廠內製作', 'N', NULL, NULL, '11-B697CCCP  ', '@', 'CA3', '廠內', '002', '廠內', NULL, '廠內', '47 ', NULL, NULL, '0 ', '0725[102]、0816[114]', 'CA2組[2]', '5/2')
    var inserts = [param.table, [param.arrayData]]
    sql = mysql.format(sql, inserts)
    // console.log(sql)
   
    actionDB(pool, sql, res)
  },

  // 新增多個row的資料
  insertMultiRow: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? VALUES '
    // ex: INSERT INTO `outsrc` VALUES ('W18', '5/4', 'A511-10704190112', '11-B697SYN', 'TYC', 'Y', 'W31', '5/3', '300 ', '0', '300 ', '1', '3', '0', '5/2', '5/2', '5/3', '5/3', '6/19', '6/19', '廠內製作', 'N', NULL, NULL, '11-B697CCCP  ', '@', 'CA3', '廠內', '002', '廠內', NULL, '廠內', '47 ', NULL, NULL, '0 ', '0725[102]、0816[114]', 'CA2組[2]', '5/2')
    var inserts = [param.table]
    for(var n=0; n<param.arrayData.length; n++) {
      if(n==param.arrayData.length-1) {
        sql += '?'
      } else {
        sql += '?, '
      }
      inserts.push([param.arrayData[n]])
    }
    sql = mysql.format(sql, inserts)
    // console.log(sql)
   
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

  // 清除資料並保留結構、欄位、索引
  truncateTable: function (req, res) {
    var param = req.query
    var sql = 'TRUNCATE TABLE ??'
    var inserts = [param.table]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },
  //-----------------帳號操作Start------------------//
  // 新增一筆使用者資料
  addUser: function (req, res) {
    var param = req.body.data
    var arrUser = []
    arrUser.push(param.account)
    arrUser.push(sha256(param.password))  // sha256加密
    arrUser.push(param.role)
    arrUser.push(param.auth)
    var sql = 'INSERT INTO ?? VALUES ?'
    var inserts = ['user', [arrUser]]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 刪除一筆使用者資料
  deleteUser: function (req, res) {
    var param = req.body.data
    var sql = 'DELETE FROM ?? WHERE ?? = ?'
    var inserts = ['user', 'account', param.account]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 修改
  updateUser: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?'
    var inserts = ['user', 'role', param.role, 'auth', param.auth, 'account', param.account]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 修改密碼
  updatePwd: function (req, res) {
    var param = req.body.data
    var pwd = sha256(param.password)  // sha256加密
    var sql = 'UPDATE `user` SET `password` = ? WHERE `account` = ?'
    var inserts = [pwd, param.account]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得所有使用者資料
  getUsers: function (req, res) {
    var sql = 'SELECT * FROM `user` WHERE `account` != "system_admin"'
    actionDB(pool, sql, res)
  }, 

  // 判斷帳號是否存在
  checkAccount: function (req, res) {
    var param = req.body.data
    // 判斷帳號是否存在
    var sql = 'SELECT * FROM `user` WHERE `account` = ? LIMIT 1'
    var inserts = [param.account]
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 判斷密碼是否正確
  checkPassword: function (req, res) {
    var param = req.body.data
    
    // 判斷帳號是否存在
    var sql = 'SELECT `password`, `role`, `auth` FROM `user` WHERE `account` = ?'
    // var cols = ['password', 'role']
    var inserts = [param.account]
    sql = mysql.format(sql, inserts)
    // actionDB(pool, sql, res)

    pool.getConnection(function (err, connection) {
      if (err) throw err
      connection.query(sql, function (err, result) {
        if (err) throw err
        // jsonWrite(res, result)
        if (typeof result === 'undefined') {
          res.json({ code: '1', msg: '操作失敗' })
        } else {
          if(sha256(param.password) === result[0].password) {
            res.json({ pass: true, role: result[0].role, auth: result[0].auth })
          } else {
            res.json({ pass: false, role: '', auth: '' })
          }
          // console.log('password: ', result[0].password)
          // console.log('role: ', result[0].role)
          // res.json(result)
        }
        // release the connection
        connection.release()
      })
    })
  },
  
  //-----------------外包負責人操作------------------//
  // 新增一筆使用者資料
  addPrincipal: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? (??) VALUES (?)'
    var inserts = ['principal', 'name', param.name]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增多個資料
  addMultiPrincipals: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? VALUES '
    var inserts = [param.table]
    for(var n=0; n<param.arrayData.length; n++) {
      if(n==param.arrayData.length-1) {
        sql += '?'
      } else {
        sql += '?, '
      }
      inserts.push([param.arrayData[n]])
    }
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 刪除一筆使用者資料
  deletePrincipal: function (req, res) {
    var param = req.body.data
    var sql = 'DELETE FROM ?? WHERE ?? = ?'
    var inserts = ['principal', 'name', param.name]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得所有使用者資料
  getPrincipals: function (req, res) {
    var sql = 'SELECT * FROM `principal`'
    actionDB(pool, sql, res)
  }, 
  //-----------------代工頭操作------------------//
  // 新增一筆使用者資料
  // addFoundry: function (req, res) {
  //   var param = req.body.data
  //   var sql = 'INSERT INTO ?? (??) VALUES (?)'
  //   var inserts = ['foundry', 'name', param.name]
  //   sql = mysql.format(sql, inserts)

  //   actionDB(pool, sql, res)
  // },

  // // 刪除一筆使用者資料
  // deleteFoundry: function (req, res) {
  //   var param = req.body.data
  //   var sql = 'DELETE FROM ?? WHERE ?? = ?'
  //   var inserts = ['foundry', 'name', param.name]
  //   sql = mysql.format(sql, inserts)

  //   actionDB(pool, sql, res)
  // },

  // // 取得所有使用者資料
  // getFoundrys: function (req, res) {
  //   var sql = 'SELECT * FROM `foundry`'
  //   actionDB(pool, sql, res)
  // }, 

  // 在foundry資料表新增'account'欄位，表示account可瀏覽的foundry
  // 新增一筆使用者資料
    addFoundry: function (req, res) {
      var param = req.body.data
      var sql = 'INSERT INTO `foundry` (`account`, `name`) VALUES (?, ?)'
      var inserts = [param.account, param.name]
      sql = mysql.format(sql, inserts)
  
      actionDB(pool, sql, res)
    },
  
    // 刪除一筆使用者資料
    deleteFoundry: function (req, res) {
      var param = req.body.data
      var sql = 'DELETE FROM `foundry` WHERE `account` = ? AND `name` = ?'
      var inserts = [param.account, param.name]
      sql = mysql.format(sql, inserts)
  
      actionDB(pool, sql, res)
    },
  
    // 取得某個帳號的代工頭資料
    getFoundrys: function (req, res) {
      var param = req.query
      var sql = 'SELECT `name` FROM `foundry` WHERE `account` = ?'
      var inserts = [param.account]
      sql = mysql.format(sql, inserts)
      actionDB(pool, sql, res)
    }, 

  // 在foundry_item資料表新增'item'欄位資料，為代工備註下拉選項
  // 新增一筆資料
  addFoundryItem: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `foundry_item` (`item`) VALUES (?)'
    var inserts = [param.item]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 刪除一筆資料
  deleteFoundryItem: function (req, res) {
    var param = req.body.data
    var sql = 'DELETE FROM `foundry_item` WHERE `item` = ?'
    var inserts = [param.item]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得所有代工頭備註項目資料
  getFoundryItems: function (req, res) {
    var sql = 'SELECT `item` FROM `foundry_item`'
    actionDB(pool, sql, res)
  },

  // 測試
  test: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO ?? VALUES ?'
    var inserts = [param.table, [param.arrayData]]
    sql = mysql.format(sql, inserts)
   
    console.log(sql)
    // actionDB(pool, sql, res)
  },


  //---------------------------------------------------
  //                   個人績效統計
  //---------------------------------------------------
  // =SUMPRODUCT((實際_開工日="")*1,(製程名稱="")*1,(有訂單="Y")*1,(外包負責人="陳婉婷")*1)
  sumP1: function (req, res) {
    var param = req.body.data

    var sql = 'SELECT COUNT(*) FROM `outsrc` WHERE ?? IS NULL AND ?? IS NULL AND ??=? AND ??=?'
    var col_start = param.xls_Col['StartDate']
    var col_processname = param.xls_Col['ProcessName']
    var col_order = param.xls_Col['Order']
    var col_principal = param.xls_Col['Principal']
    var inserts = [col_start, col_processname, col_order, 'Y', col_principal, param.Principal]

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },
  
  // =SUMPRODUCT((實際_開工日="")*1,(製程名稱="")*1,(閒置天數_24小時管控>2)*1,(有訂單="Y")*1,(外包負責人="陳婉婷")*1)
  sumP2: function (req, res) {
    var param = req.body.data

    var sql = 'SELECT COUNT(*) FROM `outsrc` WHERE ?? IS NULL AND ?? IS NULL AND ?? > 2 AND ??=? AND ??=?'
    var col_start = param.xls_Col['StartDate']
    var col_processname = param.xls_Col['ProcessName']
    var col_idleday = param.xls_Col['IdleDay']
    var col_order = param.xls_Col['Order']
    var col_principal = param.xls_Col['Principal']
    var inserts = [col_start, col_processname, col_idleday, col_order, 'Y', col_principal, param.Principal]

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // =SUMPRODUCT((有訂單="Y")*(_12天交貨日<=TODAY())*(_12天交貨日>DATE(2018,1,1))*(發放日<TODAY()-6)*(製程名稱<>"檢驗")*(製程名稱<>"抽檢")*(製程名稱<>"點膠")*(外包負責人="陳婉婷")*1)
  sumP3: function (req, res) {
    var param = req.body.data

    var today = new Date()
    var year = today.getFullYear()
    var first = new Date(year, 0, 1)   // 計算當年1月1日，月份要減1
    var date = new Date(today.getTime()-6*24*3600*1000)  // 計算6天前的日期
    var col_delivery = param.xls_Col['Delivery12Day']
    var col_release = param.xls_Col['ReleaseDate']
    var col_formnum = param.xls_Col['FormNum']
    var t_formnum = 't1.' + col_formnum
    var col_processname = param.xls_Col['ProcessName']
    var col_order = param.xls_Col['Order']
    var col_principal = param.xls_Col['Principal']
    var arrProcess = [`檢驗`, `抽檢`, `點膠`]

    var sql = 'SELECT * '
    sql +=    'FROM `outsrc` `t1` '
    sql +=    'WHERE ?? = ? '
    // sql +=    'AND ?? BETWEEN ? AND ? '
    // sql +=    'AND ?? < ? '
    sql +=    'AND NOT EXISTS (SELECT * FROM `outsrc` `t2` WHERE ?? = `t1`.?? AND ?? IN (?)) '
    sql +=    'AND ?? = ?'
    
    // var sql = 'SELECT * FROM `outsrc` `t1` WHERE `RC007`="Y" AND NOT EXISTS (SELECT * FROM `outsrc` `t2` WHERE `RC003`=`t1`.`RC003` AND `RC024`="檢驗") AND `RC036`="陳婉婷"'

    // var inserts = [col_order, 'Y', col_delivery, first, today, col_release, date, col_processname, arrProcess, col_principal, param.Principal]
    // var inserts = [col_order, 'Y', col_delivery, '1/1', '9/10', col_release, '9/4', col_processname, arrProcess, col_principal, param.Principal]
    var inserts = [col_order, 'Y', col_formnum, col_formnum, col_processname, arrProcess, col_principal, param.Principal]
    // var inserts = ['outsrc.RC003', 't1.RC003', 't1.RC024', '檢驗', 'outsrc.RC007', 'Y', 'outsrc.RC036', param.Principal]
    sql = mysql.format(sql, inserts)
    console.log('sql = ', sql)
    actionDB(pool, sql, res)
  },

  // =SUMPRODUCT((製程名稱<>"檢驗")*1,(製程名稱<>"抽檢")*1,(製程名稱<>"點膠")*1,(製程天數_6日管控<>"-")*1,(有訂單="Y")*1,(外包負責人="陳婉婷")*1)
  sumP4: function (req, res) {
    var param = req.body.data
    var col_formnum = param.xls_Col['FormNum']
    var col_processname = param.xls_Col['ProcessName']
    var col_makeday = param.xls_Col['MakeDay']
    var col_order = param.xls_Col['Order']
    var col_principal = param.xls_Col['Principal']
    var arrProcess = ['檢驗', '抽檢', '點膠']

    var sql = 'SELECT * '
    sql +=    'FROM `outsrc` `t1` '
    sql +=    'WHERE NOT EXISTS (SELECT * FROM `outsrc` `t2` WHERE ?? = `t1`.?? AND ?? IN (?)) '
    sql +=    'AND ?? != "-" '
    sql +=    'AND ?? = "Y" '
    sql +=    'AND ?? = ?'
    
    var inserts = [col_formnum, col_formnum, col_processname, arrProcess, col_makeday, col_order, col_principal, param.Principal]
    sql = mysql.format(sql, inserts)
    console.log('sql = ', sql)
    actionDB(pool, sql, res)
  },

  // =SUMPRODUCT((製程名稱<>"檢驗")*1,(製程名稱<>"抽檢")*1,(製程名稱<>"點膠")*1,(製程天數_6日管控<>"-")*1,(製程天數_6日管控>6)*1,(有訂單="Y")*1,(外包負責人="陳婉婷")*1)
  sumP5: function (req, res) {
    var param = req.body.data
    var col_formnum = param.xls_Col['FormNum']
    var col_processname = param.xls_Col['ProcessName']
    var col_makeday = param.xls_Col['MakeDay']
    var col_order = param.xls_Col['Order']
    var col_principal = param.xls_Col['Principal']
    var arrProcess = ['檢驗', '抽檢', '點膠']

    var sql = 'SELECT * '
    sql +=    'FROM `outsrc` `t1` '
    sql +=    'WHERE NOT EXISTS (SELECT * FROM `outsrc` `t2` WHERE ?? = `t1`.?? AND ?? IN (?)) '
    sql +=    'AND ?? != "-" '
    sql +=    'AND ?? = "Y" '
    sql +=    'AND ?? = ?'
    
    var inserts = [col_formnum, col_formnum, col_processname, arrProcess, col_makeday, col_order, col_principal, param.Principal]
    sql = mysql.format(sql, inserts)
    console.log('sql = ', sql)
    actionDB(pool, sql, res)
  },
}
