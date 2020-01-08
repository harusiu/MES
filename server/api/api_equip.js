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

  // 查詢某個資料表中的某個欄位的不重複資料，並排序
  getColumnItems: function (req, res) {
    var param = req.query
    // var sql = 'SELECT ?? FROM ??'
    var sql = 'SELECT DISTINCT ?? FROM ?? ORDER BY ??'
    var inserts = [param.column, param.table, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 更新多個欄位的資料
  updateData: function (req, res) {
    var param = req.body.data
    
    // var sql = 'UPDATE ?? SET ?? = ?, ?? = ? WHERE ?? = ?'
    // var inserts = [param.table, param.columns[0], param.values[0], param.columns[1], param.values[1], param.column, param.condition]
    if(param.columns.length===param.values.length) {
      var sql = 'UPDATE ?? SET '
      var inserts = [param.table]
      for(var n=0; n<param.columns.length; n++) {
        sql += '?? = ?'
        if(n===param.columns.length-1) {
          sql += ' '
        } else {
          sql += ', '
        }
        inserts.push(param.columns[n], param.values[n])
      }

      sql += 'WHERE ?? = ?' 
      inserts.push(param.column, param.condition)
      sql = mysql.format(sql, inserts)

      actionDB(pool, sql, res)
    } else {
      console.log('Error in updateData(): columns.length!==values.length')
    }
  },

  // 新增多組欄位資料
  insertData: function (req, res) {
    var param = req.body.data
    // var sql = 'INSERT INTO ?? (??, ??, ??, ??) VALUES (?, ?, ?, ?)'
    // var inserts = [param.table, param.columns[0], param.columns[1], param.columns[2], param.columns[3],
    //   param.values[0], param.values[1], param.values[2], param.values[3]]
    if(param.columns.length===param.values.length) {
      var sql = 'INSERT INTO ?? ('
      var str = ') VALUES ('
      var inserts = [param.table]

      for(let n=0; n<param.columns.length; n++) {
        if(n<param.columns.length-1) {
          sql += '??, '
          str += '?, '
        } else {
          sql += '??'
          str += '?)'
        }
        inserts.push(param.columns[n])
      }
      sql += str

      for(let n=0; n<param.columns.length; n++) {
        inserts.push(param.values[n])
      }
      
      sql = mysql.format(sql, inserts)

      actionDB(pool, sql, res)
    } else {
      console.log('Error in insertData(): columns.length!==values.length')
    }
    
  }, 

  //------------------------------------------------------------------------------------------
  // 設備的操作
  //------------------------------------------------------------------------------------------
  getAllEquipments: function(req, res) {
    var sql = 'SELECT *, DATE_FORMAT(`pur_date`, "%Y/%m/%d") AS `pur_date` FROM `equip_list`'

    actionDB(pool, sql, res)
  },

  // 檢查財產編號是否已存在
  checkId: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `equip_list` WHERE `equip_id`=?'
    var inserts = [param.equipId]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 檢查是否除了本身以外的資料，財編是否有重複
  checkOthersId: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `equip_list` WHERE `equip_id` = ? AND `uid` <> ?'
    var inserts = [param.equipId, param.uid]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得設備線別資訊
  getEquipLineItems: function (req, res) {
    var sql = 'SELECT DISTINCT `a`.`line_id`, `b`.`line_name` FROM `equip_list` AS `a` '
    sql += 'LEFT JOIN `line_item` AS `b` '
    sql += 'ON `a`.`line_id` = `b`.`line_id` ORDER BY `a`.`line_id`'

    actionDB(pool, sql, res)
  },

  // 取得某線別代號的線別名稱
  getLineName: function (req, res) {
    var param = req.query
    var sql = 'SELECT `line_name` FROM `line_item` WHERE `line_id` = ?'
    var inserts = [param.lineId]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 以財產編號查詢設備
  getEquipment: function (req, res) {
    var param = req.query
    var sql = 'SELECT *, DATE_FORMAT(`pur_date`, "%Y/%m/%d") AS `pur_date` '
    sql += 'FROM equip_list '
    sql += 'WHERE `equip_id` = ?'
    var inserts = [param.equipId]

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 查詢設備
  queryEquipment: function (req, res) {
    var param = req.query
    var sql = 'SELECT *, DATE_FORMAT(`pur_date`, "%Y/%m/%d") AS `pur_date` FROM `equip_list` '
    var inserts = []
    var flag = false

    // 處理財產編號查詢
    if(param.equipId) {
      if(!flag) {
        sql += 'WHERE `equip_id` = ? '
        flag = true
      } else {
        sql += 'AND `equip_id` = ? '
      }
      inserts.push(param.equipId)
    }

    // 處理線別查詢
    if(param.lineId) {
      if(!flag) {
        sql += 'WHERE `line_id` = ? '
        flag = true
      } else {
        sql += 'AND `line_id` = ? '
      }
      inserts.push(param.lineId)
    }

    // 處理負責人查詢
    if(param.person) {
      if(!flag) {
        sql += 'WHERE `person` = ? '
        flag = true
      } else {
        sql += 'AND `person` = ? '
      }
      inserts.push(param.person)
    }

    // 處理類別查詢
    if(param.class) {
      if(!flag) {
        sql += 'WHERE `equip_class` = ? '
        flag = true
      } else {
        sql += 'AND `equip_class` = ? '
      }
      inserts.push(param.class)
    }

    // 處理廠商查詢
    if(param.brand) {
      if(!flag) {
        sql += 'WHERE `brand` = ? '
        flag = true
      } else {
        sql += 'AND `brand` = ? '
      }
      inserts.push(param.brand)
    }

    // 處理設備名稱查詢
    if(param.name) {
      if(!flag) {
        sql += 'WHERE `equip_name` = ? '
        flag = true
      } else {
        sql += 'AND `equip_name` = ? '
      }
      inserts.push(param.name)
    }

    // 處理存放地查詢
    if(param.location) {
      if(!flag) {
        sql += 'WHERE `location` = ? '
        flag = true
      } else {
        sql += 'AND `location` = ? '
      }
      inserts.push(param.location)
    }

    // 處理存放地查詢
    if(param.section) {
      if(!flag) {
        sql += 'WHERE `section` = ? '
        flag = true
      } else {
        sql += 'AND `section` = ? '
      }
      inserts.push(param.section)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 刪除一筆設備資料
  deleteEquipment: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `equip_list` WHERE `equip_id` = ?'
    var inserts = [param.equipId]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增或更新設備資料
  // ref:  INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age)
  insertUpdateEquipment: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `equip_list` (`equip_id`, `line_id`, `person`, `equip_class`, `equip_name`, `brand`, `pur_date`, '
    sql += '`location`, `section`, `spec`, `status`, `param`, '
    sql += '`creator`, `create_date`, `modifier`, `modi_date`)'
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) '
    sql += 'ON DUPLICATE KEY UPDATE '
    sql += '`line_id`=VALUES(`line_id`), '
    sql += '`person`=VALUES(`person`), '
    sql += '`equip_class`=VALUES(`equip_class`), '
    sql += '`equip_name`=VALUES(`equip_name`), '
    sql += '`brand`=VALUES(`brand`), '
    sql += '`pur_date`=VALUES(`pur_date`), '
    sql += '`location`=VALUES(`location`), '
    sql += '`section`=VALUES(`section`), '
    sql += '`spec`=VALUES(`spec`), '
    sql += '`status`=VALUES(`status`), '
    sql += '`param`=VALUES(`param`), '
    sql += '`creator`=VALUES(`creator`), '
    sql += '`create_date`=VALUES(`create_date`), '
    sql += '`modifier`=VALUES(`modifier`), '
    sql += '`modi_date`=VALUES(`modi_date`)'
    
    var inserts = [param.id, param.lineId, param.person, param.class, param.name, param.brand, param.purDate,
                    param.location, param.section, param.spec, param.status, param.param,
                    param.creator, param.createDate, param.modifier, param.modiDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------
  // 新增設備
  //----------------
  insertEquipment: function (req, res) {
    // unpack: this.editEquip.unpack,                             // 卡式模是否可拆
    //       singleTerm: this.editEquip.singleTerm,                     // 可使用單顆端子
    //       contiTerm: this.editEquip.contiTerm,                       // 可使用連續端子
    //       tooModelTerm: JSON.stringify(this.editEquip.tooModelTerm), // 土模仔機台可使用的端子
    //       moldType: this.editEquip.moldType,   
    var param = req.body.data
    var sql = 'INSERT INTO `equip_list` (`equip_id`, `line_id`, `person`, `equip_class`, `equip_name`, `brand`, `pur_date`, '
    sql += '`location`, `section`, `unpack`, `singleTerm`, `contiTerm`, `tooMoldTerm`, `moldType`, `spec`, `status`, `param`, '
    sql += '`creator`, `create_date`)'
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    
    var inserts = [param.id, param.lineId, param.person, param.class, param.name, param.brand, param.purDate,
                    param.location, param.section, param.unpack, param.singleTerm, param.contiTerm, param.tooMoldTerm, param.moldType, param.spec, param.status, param.param,
                    param.creator, param.createDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------
  // 更新設備
  //----------------
  updateEquipment: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `equip_list` SET `equip_id`=?, `line_id`=?, `person`=?, `equip_class`=?, `equip_name`=?, `brand`=?, `pur_date`=?, '
    sql += '`location`=?, `section`=?, `unpack`=?, `singleTerm`=?, `contiTerm`=?, `tooMoldTerm`=?, `moldType`=?,`spec`=?, `status`=?, `param`=?, '
    sql += '`modifier`=?, `modi_date`=? '
    sql += 'WHERE `uid`=?'
    
    var inserts = [param.id, param.lineId, param.person, param.class, param.name, param.brand, param.purDate,
                    param.location, param.section, param.unpack, param.singleTerm, param.contiTerm, param.tooMoldTerm, param.moldType, param.spec, param.status, param.param,
                    param.modifier, param.modiDate, param.uid]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }

}
