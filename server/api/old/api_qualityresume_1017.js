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
  // =====================
  // 上傳品質管理點檔案
  // =====================
  uploadCheckPointFiles: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/MyQualityCheckPoints'
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
  // 取得品質管理點資料對應資料夾內的所有檔案路徑
  // ====================================
  getCheckPointFilePath: function (req, res) {
    /*var param = req.query
    var filePath = param.filePath
    console.log(filePath)*/
    var Dir = 'C:/Apache24/htdocs/mes/uploads/qualityresume/MyQualityCheckPoints/'
    fs.readdir(Dir, function(err, files){
      if (err) {
        console.log(err)
        return
      }
      // console.info(files)
      for(let i=0; i<files.length; i++) {
        let fn = files[i]
        files[i] = Dir + fn
      }
      res.json(files)
    })
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
  // 讀取品質管理點檔案
  // =====================
  /*getCheckPointFile: function (req, res) {
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
  //},
}