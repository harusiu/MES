var formdiable = require('formidable')
var fs = require('fs')

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

  // 查詢某個資料表中的某個欄位的不重複資料，並排序
  getColumnItems: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT ?? FROM ?? ORDER BY ??'
    var inserts = [param.column, param.table, param.column]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },


  //-----------------------------------------------------------------------
  // 模具資料操作
  //-----------------------------------------------------------------------
  searchMold: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `mold_info` '
    var inserts = []
    var flag = false
    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具財產編號查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
    }

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
    }

    // 處理保管人員查詢
    if(param.person) {
      if(!flag) {
        sql += 'WHERE `person` = ? '
        flag = true
      } else {
        sql += 'AND `person` = ? '
      }
      inserts.push(param.person)
    }

    // 處理產線線別查詢
    if(param.lineId) {
      if(!flag) {
        sql += 'WHERE `line_id` = ? '
        flag = true
      } else {
        sql += 'AND `line_id` = ? '
      }
      inserts.push(param.lineId)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 查詢模具資料裡的所有端子品號
  getAllTerm: function (req, res) {
    var sql = 'SELECT `term_model` FROM `mold_info`'

    actionDB(pool, sql, res)
  },
  
  //-------------------------
  // 取得模具資料中模具品號選項
  //-------------------------
  getMoldModelItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `mold_model` FROM `mold_info` '
    
    var inserts = []
    var flag = false
    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
    }

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
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

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //-------------------------
  // 取得模具資料中端子品號選項
  //-------------------------
  getTermModelItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT `term_model` FROM `mold_info` '
    
    var inserts = []
    var flag = false
    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
    }

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
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

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //-------------------------
  // 取得模具資料中模具財編選項
  //-------------------------
  getMoldIdItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `mold_id` FROM `mold_info` '
    
    var inserts = []
    var flag = false

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
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

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //-------------------------
  // 取得模具資料中廠商選項
  //-------------------------
  getVendorItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `vendor` FROM `mold_info` '
    
    var inserts = []
    var flag = false

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
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

    sql += 'ORDER BY `vendor`'

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //-------------------------
  // 取得模具資料中管理人選項
  //-------------------------
  getPersonItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `person` FROM `mold_info` '
    
    var inserts = []
    var flag = false

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
    }

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
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

    sql += 'ORDER BY `person`'

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //-------------------------
  // 取得模具資料中線別選項
  //-------------------------
  getLineIdItems: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `line_id` FROM `mold_info` '
    
    var inserts = []
    var flag = false

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE `mold_model` = ? '
        flag = true
      } else {
        sql += 'AND `mold_model` = ? '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
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

    // 處理模具廠商查詢
    if(param.vendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.vendor)
    }

    sql += 'ORDER BY `line_id`'

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //----------------------
  // 檢查模具資料是否已存在
  //----------------------
  checkMold: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `mold_info` '
    sql += 'WHERE `mold_id` = ? '
    var inserts = [param.moldId]

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------------
  // 檢查檢查除了自己本身，
  // 其他資料是否有重複的模具財產編號
  //----------------------
  checkOthersMoldId: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `mold_info` '
    sql += 'WHERE `mold_id` = ? AND `uid` <> ?'
    var inserts = [param.moldId, param.uid]

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增或更新模具資料
  // ref:  INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age)
  insertUpdateMoldInfo: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `mold_info` (`mold_id`, `term_model`, `mold_model`, `vendor`, `person`, `line_id`, `pur_date`) '
    sql += 'VALUES(?,?,?,?,?,?,?) '
    sql += 'ON DUPLICATE KEY UPDATE '
    sql += '`mold_model`=VALUES(`mold_model`), '
    sql += '`vendor`=VALUES(`vendor`), '
    sql += '`person`=VALUES(`person`), '
    sql += '`line_id`=VALUES(`line_id`), '
    sql += '`pur_date`=VALUES(`pur_date`)'
    
    var inserts = [param.moldId, param.termModel, param.moldModel, param.vendor, param.person, param.lineId, param.purDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //---新增模具資料---//
  insertMold: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `mold_info` (`mold_id`, `mold_model`, `term_model`, `vendor`, `person`, `line_id`, `pur_date`, `remark`, `modify_id`, `modify_date`) '
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?)'
    
    
    var inserts = [param.moldId, param.moldModel, param.termModel, param.vendor, param.person, param.lineId, param.purDate, param.remark, param.modifyId, param.modifyDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //---更新模具資料---//
  updateMold: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `mold_info` SET `mold_id`=?, `mold_model`=?, `term_model`=?, `vendor`=?, '
    sql += '`person`=?, `line_id`=?, `pur_date`=?, `remark`=?, `modify_id`=?, `modify_date`=? '
    sql += 'WHERE `uid`=?'
    
    var inserts = [param.moldId, param.moldModel, param.termModel, param.vendor, 
      param.person, param.lineId, param.purDate, param.remark, param.modifyId, param.modifyDate, 
      param.uid]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 刪除一筆模具資料
  deleteMoldInfo: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `mold_info` WHERE `mold_id` = ?'
    var inserts = [param.moldId]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //-----------------------------------------------------------------------
  // 模片資料操作
  //-----------------------------------------------------------------------
  // 查詢所有模片資料
  getAllTemplet: function (req, res) {
    // var sql = 'SELECT `a`.`temp_class`, `a`.`temp_model`, `a`.`vendor`, `a`.`stock`, '
    // sql += '`b`.`mold_model`, `b`.`term_model`, `b`.`line_id`, `c`.`line_name`, `b`.`mold_id` '
    // sql += 'FROM `mold_temp` AS `a` LEFT JOIN `mold_info` AS `b` ON (`a`.`temp_class`="線皮上模" AND `a`.`temp_model`=`b`.`temp_cov_t`) '
    // sql += 'OR (`a`.`temp_class`="線皮下模" AND `a`.`temp_model`=`b`.`temp_cov_b`) '
    // sql += 'OR (`a`.`temp_class`="線心上模" AND `a`.`temp_model`=`b`.`temp_cor_t`) '
    // sql += 'OR (`a`.`temp_class`="線心下模" AND `a`.`temp_model`=`b`.`temp_cor_b`) '
    // sql += 'LEFT JOIN `line_item` AS `c` ON `b`.`line_id`=`c`.`line_id`'

    // var sql = 'SELECT `a`.`temp_class`, `a`.`temp_model`, `a`.`vendor`, `a`.`stock`, '
    // sql += '`b`.`mold_model`, `b`.`term_model`, `b`.`line_id`, `c`.`line_name`, `b`.`mold_id` '
    // sql += 'FROM `mold_temp` AS `a` LEFT JOIN `mold_info` AS `b` ON `a`.`term_model`=`b`.`term_model` '
    // sql += 'LEFT JOIN `line_item` AS `c` ON `b`.`line_id`=`c`.`line_id`'

    // var sql = 'SELECT `a`.`temp_class`, `a`.`temp_model`, `a`.`vendor`, `a`.`stock`, '
    // sql += '`b`.`mold_model`, `b`.`term_model` '
    // sql += 'FROM `mold_temp` AS `a` LEFT JOIN `mold_info` AS `b` ON `a`.`term_model`=`b`.`term_model`'

    var sql = 'SELECT * FROM `temp_list`'

    actionDB(pool, sql, res)
  },

  // 查詢模片
  searchTemp: function (req, res) {
    var param = req.query

    var sql = 'SELECT * FROM `temp_list` '
    
    var inserts = []
    var flag = false
    // 處理模片類型查詢
    if(param.tempClass) {
      if(!flag) {
        sql += 'WHERE `temp_class` = ? '
        flag = true
      } else {
        sql += 'AND `temp_class` = ? '
      }
      inserts.push(param.tempClass)
    }

    // 處理模片品號查詢
    if(param.tempModel) {
      if(!flag) {
        sql += 'WHERE `temp_model` = ? '
        flag = true
      } else {
        sql += 'AND `temp_model` = ? '
      }
      inserts.push(param.tempModel)
    }

    // 處理模片廠商查詢
    if(param.tempVendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.tempVendor)
    }

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?)) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 取得模片型號選項
  getOptionsTempModel: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `temp_model` FROM `temp_list` '
    
    var inserts = []
    var flag = false
    // 處理模片類型查詢
    if(param.tempClass) {
      if(!flag) {
        sql += 'WHERE `temp_class` = ? '
        flag = true
      } else {
        sql += 'AND `temp_class` = ? '
      }
      inserts.push(param.tempClass)
    }

    // 處理模片廠商查詢
    if(param.tempVendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.tempVendor)
    }

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?)) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    sql += 'ORDER BY `temp_model`'

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //----------------------
  // 取得模片廠商選項
  //----------------------
  getOptionsTempVendor: function (req, res) {
    var param = req.query

    var sql = 'SELECT DISTINCT `vendor` FROM `temp_list` '
    
    var inserts = []
    var flag = false
    // 處理模片類型查詢
    if(param.tempClass) {
      if(!flag) {
        sql += 'WHERE `temp_class` = ? '
        flag = true
      } else {
        sql += 'AND `temp_class` = ? '
      }
      inserts.push(param.tempClass)
    }

    // 處理模片品號查詢
    if(param.tempModel) {
      if(!flag) {
        sql += 'WHERE `temp_model` = ? '
        flag = true
      } else {
        sql += 'AND `temp_model` = ? '
      }
      inserts.push(param.tempModel)
    }
    
    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.moldModel)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?)) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }
    sql += 'ORDER BY `vendor`'

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //----------------------
  // 取得模具品號選項
  //----------------------
  getOptionsMoldModel: function (req, res) {
    var param = req.query

    // var sql = 'SELECT `mold_model`->"$[0]" FROM `temp_list` '
    var sql = 'SELECT `mold_model` FROM `temp_list` '
    
    var inserts = []
    var flag = false
    // 處理模片類型查詢
    if(param.tempClass) {
      if(!flag) {
        sql += 'WHERE `temp_class` = ? '
        flag = true
      } else {
        sql += 'AND `temp_class` = ? '
      }
      inserts.push(param.tempClass)
    }

    // 處理模片品號查詢
    if(param.tempModel) {
      if(!flag) {
        sql += 'WHERE `temp_model` = ? '
        flag = true
      } else {
        sql += 'AND `temp_model` = ? '
      }
      inserts.push(param.tempModel)
    }

    // 處理模片廠商查詢
    if(param.tempVendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.tempVendor)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`term_model`, JSON_ARRAY(?)) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`term_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.termModel)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  //----------------------
  // 取得端子品號選項
  //----------------------
  getOptionsTermModel: function (req, res) {
    var param = req.query

    var sql = 'SELECT `term_model` FROM `temp_list` '
    
    var inserts = []
    var flag = false
    // 處理模片類型查詢
    if(param.tempClass) {
      if(!flag) {
        sql += 'WHERE `temp_class` = ? '
        flag = true
      } else {
        sql += 'AND `temp_class` = ? '
      }
      inserts.push(param.tempClass)
    }

    // 處理模片品號查詢
    if(param.tempModel) {
      if(!flag) {
        sql += 'WHERE `temp_model` = ? '
        flag = true
      } else {
        sql += 'AND `temp_model` = ? '
      }
      inserts.push(param.tempModel)
    }

    // 處理模片廠商查詢
    if(param.tempVendor) {
      if(!flag) {
        sql += 'WHERE `vendor` = ? '
        flag = true
      } else {
        sql += 'AND `vendor` = ? '
      }
      inserts.push(param.tempVendor)
    }

    // 處理模具品號查詢
    if(param.moldModel) {
      if(!flag) {
        sql += 'WHERE JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
        flag = true
      } else {
        sql += 'AND JSON_CONTAINS(`mold_model`, JSON_ARRAY(?) ) '
      }
      inserts.push(param.moldModel)
    }

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },
  
  //------------------------
  // 取得資料表中所有模片廠商
  //------------------------
  getAllVendor: function (req, res) {
    var sql = 'SELECT DISTINCT `vendor` FROM `temp_list` '
    sql += 'ORDER BY `vendor`'

    actionDB(pool, sql, res)
  },

  //----------------------
  // 取得所有端子品號
  //----------------------
  getAllTermModel: function (req, res) {
    var sql = 'SELECT DISTINCT `term_model` FROM `term_mold` '
    sql += 'ORDER BY `term_model`'

    actionDB(pool, sql, res)
  },

  //----------------------
  // 檢查模片資料是否已存在
  //----------------------
  checkTemp: function (req, res) {
    var param = req.query
    var sql = 'SELECT COUNT(*) FROM `temp_list` '
    sql += 'WHERE `temp_class` = ? '
    sql += 'AND `temp_model` = ?'
    var inserts = [param.tempClass, param.tempModel]

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------------
  // 新增模片資料
  //----------------------
  insertTemp: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `temp_list` (`temp_class`, `temp_model`, `vendor`, `stock`, `mold_model`, `term_model`, `modify_id`, `modify_date`) '
    sql += 'VALUES(?,?,?,?,?,?,?, ?)'
    var inserts = [param.tempClass, param.tempModel, param.tempVendor, param.stock, param.moldModel, param.termModel, param.modifyId, param.modifyDate]
    sql = mysql.format(sql, inserts)


    actionDB(pool, sql, res)
  },

  //----------------------
  // 刪除模片資料
  //----------------------
  deleteTemp: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `temp_list` WHERE `temp_class` = ? AND `temp_model` = ?' 
    var inserts = [param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  //----------------------
  // 更新模片資料
  //----------------------
  updateTemp: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `temp_list` SET `vendor`=?, `mold_model`=?, `term_model`=?, `modify_id`=?, `modify_date`=? '
    sql += 'WHERE `temp_class`=? AND `temp_model`=?'
    var inserts = [param.tempVendor, param.moldModel, param.termModel, param.modifyId, param.modifyDate, param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得模片庫存量
  getTempStock: function (req, res) {
    var param = req.query
    var sql = 'SELECT `stock` FROM `temp_list` WHERE `temp_class` = ? AND `temp_model` = ?'
    var inserts = [param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得某一種類的所有模片品號
  getTempModels: function (req, res) {
    var param = req.query
    var sql = 'SELECT DISTINCT `temp_model` FROM `temp_list` WHERE `temp_class` = ? ORDER BY `temp_model`'
    var inserts = [param.tempClass]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得某一種模片型號的資料
  getTempInfo: function (req, res) {
    var param = req.query
    var sql = 'SELECT `vendor`, `stock` FROM `temp_list` '
    sql += 'WHERE `temp_class` = ? AND `temp_model` = ?'
    var inserts = [param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 新增模片入出庫資料
  insertTempInv: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `temp_inv` (`temp_class`, `temp_model`, `action`, `amount`, `stock`, `date`, `remark`, `modify_id`, `modify_date`) '
    sql += 'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)'
    
    
    var inserts = [param.tempClass, param.tempModel, param.action, param.amount, param.stock, param.date, param.remark, param.modifyId, param.modifyDate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 模片入庫
  tempStockIn: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `temp_list` SET `stock` = `stock` + ? '
    sql += 'WHERE `temp_class` = ? AND `temp_model` = ?'
    var inserts = [param.amount, param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 模片出庫
  tempStockOut: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `temp_list` SET `stock` = `stock` - ? '
    sql += 'WHERE `temp_class` = ? AND `temp_model` = ?'
    var inserts = [param.amount, param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得模片入出庫紀錄
  getTempStockRecord: function (req, res) {
    var param = req.query
    var sql = 'SELECT *, DATE_FORMAT(`date`, "%Y/%m/%d") AS `date` FROM `temp_inv` '
    sql += 'WHERE `temp_class` = ? AND `temp_model` = ?'
    var inserts = [param.tempClass, param.tempModel]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // 取得模片入出庫列印明細
  getTempStockIO: function(req, res) {
    // Reference: select userid,username from register where DATE_FORMAT(zhucetime,'%Y-%m') ='2012-02'

    // SELECT a.*, DATE_FORMAT(a.date, "%Y/%m/%d") AS date, b.vendor
    // FROM temp_inv AS a 
    // LEFT JOIN temp_list AS b 
    // ON (a.temp_class=b.temp_class AND a.temp_model=b.temp_model)

    var param = req.query
    var sql = 'SELECT a.*, DATE_FORMAT(a.date, "%Y/%m/%d") AS `date`, b.vendor '
    sql += 'FROM `temp_inv` AS a '
    sql += 'LEFT JOIN `temp_list` AS b '
    sql += 'ON (a.temp_class=b.temp_class AND a.temp_model=b.temp_model) '
    
    var inserts = []
    var flag = false

    if(param.monthStart && !param.monthEnd) {  //只查詢某個月份
      sql += 'WHERE DATE_FORMAT(`date`,"%Y-%m") = ? '
      inserts.push(param.monthStart)
      flag = true
    } else if(param.monthStart && param.monthEnd) {  //查詢月分區間
      sql += 'WHERE (DATE_FORMAT(`date`,"%Y-%m") >= ? AND DATE_FORMAT(`date`,"%Y-%m") <= ?) '
      inserts.push(param.monthStart, param.monthEnd)
      flag = true
    }

    if(param.tempClass) {
      if(flag) {
        sql += 'AND a.temp_class = ? '
      } else {
        sql += 'WHERE a.temp_class = ? '
        flag = true
      }
      inserts.push(param.tempClass)
    }

    if(param.tempModel) {
      if(flag) {
        sql += 'AND a.temp_model = ? '
      } else {
        sql += 'WHERE a.temp_model = ? '
        flag = true
      }
      inserts.push(param.tempModel)
    }

    if(param.tempVendor) {
      if(flag) {
        sql += 'AND vendor = ? '
      } else {
        sql += 'WHERE vendor = ? '
        flag = true
      }
      inserts.push(param.tempVendor)
    }

    if(param.tempRemark) {
      if(flag) {
        sql += 'AND a.remark = ? '
      } else {
        sql += 'WHERE a.remark = ? '
        flag = true
      }
      inserts.push(param.tempRemark)
    }
    
    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // 取得模片入出庫備註選項
  getTempStockRemark: function(req, res) {
    var sql = 'SELECT DISTINCT `remark` FROM `temp_inv`'
    actionDB(pool, sql, res)
  },
  
  //-------------------------------------------------------------------------------------------
  // 金相資料操作
  //-------------------------------------------------------------------------------------------
  searchMeta: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `meta_list` '
    var inserts = []
    
    var flag = false
    // 處理模具財編查詢
    if(param.moldId) {
      if(!flag) {
        sql += 'WHERE `mold_id` = ? '
        flag = true
      } else {
        sql += 'AND `mold_id` = ? '
      }
      inserts.push(param.moldId)
    }

    // 處理端子品號查詢
    if(param.termModel) {
      if(!flag) {
        sql += 'WHERE `term_model` = ? '
        flag = true
      } else {
        sql += 'AND `term_model` = ? '
      }
      inserts.push(param.termModel)
    }

    // 處理線徑規格查詢
    if(param.wireSpec) {
      if(!flag) {
        sql += 'WHERE `wire_spec` = ? '
        flag = true
      } else {
        sql += 'AND `wire_spec` = ? '
      }
      inserts.push(param.wireSpec)
    }

    // 處理委託人查詢
    if(param.consignor) {
      if(!flag) {
        sql += 'WHERE `consignor` = ? '
        flag = true
      } else {
        sql += 'AND `consignor` = ? '
      }
      inserts.push(param.consignor)
    }

    // 處理委託日查詢
    if(param.commisDate) {
      if(!flag) {
        sql += 'WHERE `commis_date` = ? '
        flag = true
      } else {
        sql += 'AND `commis_date` = ? '
      }
      inserts.push(param.commisDate)
    }

    // 處理實驗者查詢
    if(param.experimenter) {
      if(!flag) {
        sql += 'WHERE `experimenter` = ? '
        flag = true
      } else {
        sql += 'AND `experimenter` = ? '
      }
      inserts.push(param.experimenter)
    }

    // 處理完成時間查詢
    if(param.finishDate) {
      if(!flag) {
        sql += 'WHERE `finish_date` = ? '
        flag = true
      } else {
        sql += 'AND `finish_date` = ? '
      }
      inserts.push(param.finishDate)
    }

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // ================
  // 查詢某筆金相資料
  // ================
  getOneMeta: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `meta_list` WHERE `sn` = ?'
    var inserts = [param.sn]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // =============
  // 新增金相資料
  // =============
  addMeta: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `meta_list` (`commis_date`, `consignor`, `mold_id`, `term_model`, `wire_spec`, `manufacture`, '
    sql += '`fft_w`, `fft_t`, `ffb_w`, `ffb_t`, `bft_w`, `bft_t`, `bfb_w`, `bfb_t`, `bound`) '
    sql += 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    var inserts = [param.commisDate, param.consignor, param.moldId, param.termModel, param.wireSpec, param.manufacture,
      param.fftW, param.fftT, param.ffbW, param.ffbT, param.bftW, param.bftT, param.bfbW, param.bfbT, param.bound]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // =============
  // 刪除金相資料
  // =============
  deleteMeta: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `meta_list` WHERE `sn` = ?'
    var inserts = [param.sn]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // =============
  // 更新金相資料
  // =============
  updateMeta: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE `meta_list` SET `commis_date`=?, `consignor`=?, `mold_id`=?, `term_model`=?, `wire_spec`=?, '
    sql += '`manufacture`=?, `customer`=?, `customer_show`=?, '
    sql += '`fft_w`=?, `fft_t`=?, `ffb_w`=?, `ffb_t`=?, `bft_w`=?, `bft_t`=?, `bfb_w`=?, `bfb_t`=?, '
    sql += '`bound`=?, `ffoot_h`=?, `ffoot_w`=?, `bfoot_h`=?, `bfoot_w`=?, '
    sql += '`pull_force`=?, `term_t`=?, `avg_peak`=?, `dual_horn`=?, `only_for`=?, `finish_date`=?, `experimenter`=?, '
    sql += '`cal1_w`=?, `cal1_area`=?, `cal1_sb`=?, `cal1_cfe`=?, `cal1_gh`=?, '
    sql += '`cal2_a`=?, `cal2_b`=?, `cal2_c`=?, `cal2_d`=?, `cal2_e`=?, `cal2_cmpr`=?, '
    sql += '`sb`=?, `cfe`=?, `gh`=?, `comp_ratio`=?, '
    sql += '`result_sb`=?, `result_cfe`=?, `result_gh`=?, `result_cmpr`=?, `result`=?, `cal_method`=? '
    sql += 'WHERE `sn` = ?'

    var inserts = [param.commisDate, param.consignor, param.moldId, param.termModel, param.wireSpec, 
      param.manufacture, param.customer, param.customerShow,
      param.fftW, param.fftT, param.ffbW, param.ffbT, param.bftW, param.bftT, param.bfbW, param.bfbT,
      param.bound, param.ffootH, param.ffootW, param.bfootH, param.bfootW,
      param.pullForce, param.termT, param.avgPeak, param.dualHorn, param.onlyFor, param.finishDate, param.experimenter,
      param.metaW, param.metaArea, param.metaSb, param.metaCFE, param.metaGh, 
      param.a, param.b, param.c, param.d, param.e, param.cmpR,
      param.Sb, param.CFE, param.Gh, param.compRatio,
      param.resSb, param.resCFE, param.resGh, param.resCmpR, param.result, param.calMethod,
      param.sn]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // ==================
  // 取得所有線材的資料
  // ==================
  getAllWireSpec: function (req, res) {
    var sql = 'SELECT * FROM `meta_wire`'
    actionDB(pool, sql, res)
  },
  
  // ================
  // 取得線材的截面積
  // ================
  getWireArea: function (req, res) {
    var param = req.query
    var sql = 'SELECT `area` FROM `meta_wire` '
    sql += 'WHERE `wire_mat` = ? AND `single_dia` = ? AND `strand_num` = ?'
    var inserts = [param.wireMat, param.singleDia, param.strandNum]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // ================
  // 新增線材
  // ================
  addWire: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `meta_wire` (`wire_mat`, `wire_dia`, `single_dia`, `strand_num`, `area`) '
    sql += 'VALUES (?, ?, ?, ?, ?)'
    var inserts = [param.wireMat, param.wireDia, param.singleDia, param.strandNum, param.area]

    sql = mysql.format(sql, inserts)
    actionDB(pool, sql, res)
  },

  // =====================
  // 上傳金相附件圖檔
  // =====================
  uploadImage: function (req, res) {
    const form = new formdiable.IncomingForm()
    
    form.on('file', (field, file) => {
      // Do something with the file
      // e.g. save it to the database
      // you can access it using file.path

      var strs = field.split('-')
      if(strs.length !== 2) {
        console.log('Error in uploadImage(): 圖檔field格式不正確!')
        res.json({code:-1, message:'圖檔field格式不正確!'})
        return
      }
      var sn = strs[0].slice(3)
      var fileNo = strs[1].slice(5)

      /* sn: 1-100的圖檔放置於'sn1-100'資料夾，sn: 101-200的圖檔放置於'sn101-200'資料夾，以此類推 */
      /* sn:1圖檔放置於'sn1-100/1'的資料夾，sn:2圖檔放置於'sn1-100/2'的資料... */
      var folderNo = Math.ceil(Number(sn) / 100)   // 向上取整
      var folder = 'sn' + String(folderNo*100-99) + '-' + String(folderNo*100)

      var targetDir = 'C:/Apache24/htdocs/mes/uploads/' + folder

      // 圖檔移動的目錄資料夾，不存在時創建資料夾
      if (!fs.existsSync(targetDir)) {
          fs.mkdir(targetDir, function(err) {
            if(err) throw err
          })
      }
      
      /* 建立個別金相報告附件資料夾 */
      targetDir += '/' + sn
      if (!fs.existsSync(targetDir)) {
        fs.mkdir(targetDir, function(err) {
          if (err) throw err
        })
      }

      var fileExt = file.name.substring(file.name.lastIndexOf('.'))
      var filename = fileNo + fileExt
      var oldpath = file.path
      var newpath = targetDir+'/'+filename
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })

    form.parse(req)
  },
  
  // ====================================
  // 取得金相資料對應資料夾內的所有檔案路徑
  // ====================================
  getFilePath: function (req, res) {
    var param = req.query
    var sn = param.sn

    var folderNo = Math.ceil(Number(sn) / 100)   // 向上取整
    var folder = 'sn' + String(folderNo*100-99) + '-' + String(folderNo*100)
    var Dir = 'C:/Apache24/htdocs/mes/uploads/' + folder + '/' + sn

    /* 檢查資料夾是否存在 */
    if (fs.existsSync(Dir)) {
      /* 取得資料夾內檔案 */
      fs.readdir(Dir, function(err, files){
        if (err) {
          console.log(err)
          return
        }
        // console.info(files)
        for(let i=0; i<files.length; i++) {
          let fn = files[i]
          files[i] = Dir + '/' + fn
        }
        res.json(files)
      })
    } else {
      res.json({ code: 1, msg: 'No such directory:"'+Dir+'"'})
    }
  },

  // =====================
  // 讀取金相附件圖檔
  // =====================
  getImage: function (req, res) {
    var param = req.query
    var filePath = param.filePath
    var fileExt = filePath.substring(filePath.lastIndexOf('.'))

    var bData = fs.readFileSync(filePath)
    var base64Str = bData.toString('base64')
    var datauri = null
    if(fileExt==='.png') {
      datauri = 'data:image/png;base64,' + base64Str
    }
    if(fileExt==='.jpg' || fileExt==='.jpeg' || fileExt==='.JPG') {
      datauri = 'data:image/jpg;base64,' + base64Str
    }
    if(fileExt==='.gif') {
      datauri = 'data:image/gif;base64,' + base64Str
    }
    if(fileExt==='.bmp') {
      datauri = 'data:image/bmp;base64,' + base64Str
    }

    res.end(datauri)
    
    /* Reference=> https://www.bbsmax.com/A/VGzloW38db/ */
    // var bData = fs.readFileSync('C:/Apache24/htdocs/mes/uploads/sn1-100/1/7.png')
    // var base64Str = bData.toString('base64')
    // var datauri = 'data:image/png;base64,' + base64Str
    
    // res.end(datauri)
  },

  // =====================
  // 刪除資料夾內所有檔案
  // =====================
  deleteDirFiles: function (req, res) {
    var param = req.query
    var sn = param.sn

    var folderNo = Math.ceil(Number(sn) / 100)   // 向上取整
    var folder = 'sn' + String(folderNo*100-99) + '-' + String(folderNo*100)
    var path = 'C:/Apache24/htdocs/mes/uploads/' + folder + '/' + sn

    let files = []
    if(fs.existsSync(path)){
      files = fs.readdirSync(path)
      files.forEach((file, index) => {
        let curPath = path + "/" + file
        fs.unlinkSync(curPath)   //刪除檔案
      })
    }

    res.end()
  },

  // =====================
  // 刪除資料夾內某一檔案
  // =====================
  deleteFile: function (req, res) {
    var param = req.query
    var filePath = param.filePath
    
    console.log('filePath: ', filePath)
    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)   //刪除檔案
      console.log('delete: ', filePath)
      res.end()
    }
  },

  // =====================
  // 刪除資料夾內相同檔名(不同副檔名)的檔案
  // =====================
  deleteFiles: function (req, res) {
    var param = req.query
    var sn = param.sn
    var fileIndex = param.fileIndex

    var folderNo = Math.ceil(Number(sn) / 100)   // 向上取整
    var folder = 'sn' + String(folderNo*100-99) + '-' + String(folderNo*100)
    var path = 'C:/Apache24/htdocs/mes/uploads/' + folder + '/' + sn
    
    let files = []
    if(fs.existsSync(path)){
      files = fs.readdirSync(path)
      files.forEach((file, index) => {
        let fn = file.substring(0, file.lastIndexOf('.'))
        /* 若有重複檔名(不同副檔名)的檔案，將之刪除 */
        if(fileIndex.indexOf(fn) !== -1) {
          let curPath = path + "/" + file
          fs.unlinkSync(curPath)   //刪除檔案
        }
      })
      res.end()
    }
  },
  // =====================
  // 刪除資料夾內的檔案及資料夾
  // =====================
  deleteDir: function (req, res) {
    var param = req.query
    var sn = param.sn

    var folderNo = Math.ceil(Number(sn) / 100)   // 向上取整
    var folder = 'sn' + String(folderNo*100-99) + '-' + String(folderNo*100)
    var path = 'C:/Apache24/htdocs/mes/uploads/' + folder + '/' + sn

    let files = []
    if(fs.existsSync(path)){
      files = fs.readdirSync(path)
      files.forEach((file, index) => {
        let curPath = path + "/" + file
        fs.unlinkSync(curPath)   //刪除檔案
      })
      fs.rmdirSync(path)  // 刪除資料夾
    }

    res.end()
  },
  //-------------------------------------------------------------------------------------------
  // 
  //-------------------------------------------------------------------------------------------
  DoOperationLog: function (req, res) {
    var param = req.query
    var sql = 'INSERT INTO `staff_log` ('
    sql += '`staff_no`, `op_no`, `join_date`, `note`) VALUES(?, ?, ?, ?)'
    var inserts = [param.staff_no, param.op_no, param.join_date, param.note]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  }
}