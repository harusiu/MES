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
  // 新增或更新首中末資料
  // ref:  INSERT INTO table (id, name, age) VALUES(1, "A", 19) ON DUPLICATE KEY UPDATE name=VALUES(name), age=VALUES(age)
  insertUpdateQCInfo: function (req, res) {
    var param = req.body.data
    var sql = 'INSERT INTO `qc_periodcheck` (`mold_id`, `term_model`, `mold_model`, `vendor`, `person`, `line_id`, `pur_date`) '
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
  //-------------------------------------------------------------------------------------------
  // 品質管理點資料操作 參考 - 金相資料操作
  //-------------------------------------------------------------------------------------------
  /*searchProductId: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `prod_picture` '
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

    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  // ================
  // 查詢某筆品質管理點資料
  // ================
  getOneQualityResumePoint: function (req, res) {
    var param = req.query
    var sql = 'SELECT * FROM `meta_list` WHERE `sn` = ?'
    var inserts = [param.sn]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },*/
  // =====================
  // 取得所有品號
  // =====================
  getAllProductId: function (req, res) {
    var sql = 'SELECT `product_id` FROM `product_process`'
    actionDB(pool, sql, res)
  },
  // =====================
  // 上傳品質管理點檔案
  // =====================
  uploadCheckPointFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      console.log(file)
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/MyQualityCheckPoints'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdir(targetDir, function(err) {
          if(err) throw err
        })
    }
    /* move uploaded file from old path to new path */
    fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // =====================
  // 上傳出貨檢查成績書檔案
  // =====================
  uploadQualityCheckResultFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/QualityCheckResult'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // ====================================
  // 取得對應資料夾內的所有檔案路徑
  // ====================================
  getFilePath: function (req, res) {
    var param = req.query
    var prodId = param.prodId;
    var componentName = param.componentName;
    console.log(componentName);
    var Dir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/' + componentName + '/';
    fs.readdir(Dir, function(err, files){
      if (err) {
        console.log(err)
        return
      }
      console.log(files)
      function filterItems(arr, query) {
        return arr.filter(function(el) {
            return el.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        })
      }
      res.json(filterItems(files, prodId))
    })
  },
  // =====================
  // 讀取資料夾內某一檔案檔案
  // =====================
  getFile: function (req, res) {
    console.log(req)
    var param = req.query
    var componentName = param.componentName;
    var Dir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/' + componentName + '/';
    console.log(param)
    var filePath = Dir + param.filePath
    var tempPath = filePath.split('.');
    var fileName = param.filePath;
    var fileExt = filePath.substring(filePath.lastIndexOf('.'))
    console.log(fileExt)
    var bData = fs.readFileSync(filePath);
    var base64Str = bData.toString('base64');
    var datauri = null;
    if(fileExt==='.pdf') {
      datauri = 'data:application/pdf;base64,' + base64Str;
    }
    if(fileExt==='.doc') {
      datauri = 'data:application/msword;base64,' + base64Str
    }
    if(fileExt==='.docx') {
      datauri = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + base64Str
    }
    if(fileExt==='.xlsx') {
      datauri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,' + base64Str
    }
    if(fileExt==='.xls') {
      datauri = 'data:application/vnd.ms-excel,' + base64Str
    }
    var result = {
      filePath: filePath,
      fileName: fileName,
      base64Str: base64Str,
      //binaryData: bData,
      uri: datauri,
      fileExt: fileExt
    }
    res.json(result)
    
    /* Reference=> https://www.bbsmax.com/A/VGzloW38db/ */
    // var bData = fs.readFileSync('C:/Apache24/htdocs/mes/uploads/sn1-100/1/7.png')
    // var base64Str = bData.toString('base64')
    // var datauri = 'data:image/png;base64,' + base64Str
    
    // res.end(datauri)
  },
  // =====================
  // 刪除資料夾內某一檔案
  // =====================
  deleteFile: function (req, res) {
    var param = req.query
    var componentName = param.componentName;
    var Dir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/' + componentName + '/';
    var filePath = Dir + param.filePath
    console.log('filePath: ', filePath)
    if(fs.existsSync(filePath)){
      fs.unlinkSync(filePath)   //刪除檔案
      console.log('delete: ', filePath)
      res.json('file deleted')
    }
  },
  // =====================
  // 上傳換線手順書檔案
  // =====================
  uploadLineChangeProcedureFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/LineChangeProcedure'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // =====================
  // 上傳管制計劃書檔案
  // =====================
  uploadControlProposalFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/ControlProposal'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // =====================
  // 上傳包裝指示書檔案
  // =====================
  uploadPackingInstructionFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/PackingInstruction'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // =====================
  // 上傳零件位置圖檔案
  // =====================
  uploadComponentMapFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/ComponentMap'
      var oldpath = file.path
      var newpath = targetDir+"/"+file.name
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
}