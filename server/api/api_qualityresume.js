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
  //      取得所有品號
  // =====================
  getAllProductId: function (req, res) {
    var sql = 'SELECT `product_id` FROM `product_process`'
    actionDB(pool, sql, res)
  },
  // =====================
  //   以品號取得製程資料
  // =====================
  getProcessSpec: function (req, res) {
    var params = req.query;
    //console.log(params);
    var sql = 'SELECT `step` FROM `product_process` WHERE `product_id` = ?';
    var inserts = [params.productId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res)
  },
  // =====================
  //   依管制工程取得管制重點
  // =====================
  getControlTitle: function (req, res) {
    var params = req.query;
    var sql = 'SELECT `index`, control_title, check_method, need_input_std FROM qc_controlmethod WHERE control_method = ? ORDER BY `index` ASC';
    var inserts = [params.controlMethod];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res)
  },
  // =====================
  //   更新管制重點
  // =====================
  addControlTitle: function (req, res) {
    var params = req.query;
    var sql = 'INSERT INTO qc_controlmethod (control_method, `index`, control_title, check_method, need_input_std) VALUES(?,?,?,?,?)';
    var inserts = [params.control_method, params.index, params.control_title, params.check_method, params.need_input_std];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res)
  },
  upadteControlTitle: function (req, res) {
    var data = req.body.data;
    console.log(data);
    var sql = 'INSERT INTO qc_controlmethod (control_method, `index`, control_title, check_method, need_input_std) '
    sql += 'VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE control_title = ?, check_method = ?, need_input_std = ?'
    var inserts = [data.control_method, data.index, data.control_title, data.check_method, data.need_input_std, data.control_title, data.check_method, data.need_input_std];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  }, 
  deleteControlTitle: function (req, res) {
    var params = req.query;
    var sql = 'DELETE FROM qc_controlmethod WHERE control_title = ? AND control_method = ? AND check_method = ? AND `index` = ?';
    var inserts = [params.control_title, params.control_method, params.check_method, params.index];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res)
  },
  insertControlTitleStandard: function (req, res) {
    var data = req.body.data;
    console.log(data);
    var sql = 'INSERT INTO qc_controltitle_std (prod_id, process_id, wire_no, term_module, term_module_LR, '
    sql += 'control_method, control_title, check_method, standard, upperbound, lowerbound) '
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE standard = ?, upperbound = ?, lowerbound = ?'
    var inserts = [data.prod_id, data.process_id, data.wire_no, data.term_module, data.term_module_LR, 
                   data.control_method, data.control_title, data.check_method, 
                   data.standard, data.upperbound, data.lowerbound, data.standard, data.upperbound, data.lowerbound];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  }, 
  getStandard: function (req, res) {
    var params = req.query;
    var sql = 'SELECT * FROM qc_controltitle_std WHERE prod_id = ? AND process_id = ? AND control_method = ? AND control_title = ? ';
    sql += 'AND term_module = ? ';
    var inserts = [params.prod_id, params.process_id, params.control_method, params.control_title, params.term_module];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res)
  },
  // ===================================================
  //   以品號、檢規序號取得線材名稱 - 裁線、電線灌包製程
  // ===================================================
  getWire: function(req, res) {
    var params = req.query;
    console.log(params);
    var sql = 'SELECT `part_no`, cut_left, cut_right FROM `cmap_line` ';
    sql += 'WHERE `prod_no` = ? '
    sql += 'AND ver_no=(select max(ver_no) from cmap_line ';
    sql += 'WHERE prod_no = ? and length(ver_no)=4)'
    sql += 'AND `seq_no` = ?'
    var inserts = [params.productId, params.productId, params.specId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  // ==================================================================
  //   裁線製程 - 以製令單別、品號、檢規序號、線材名稱取得最新的首中末資料 - 
  // ==================================================================
  getCutWirePeriodData: function(req, res) {
    var params = req.query;
    var sql = 'SELECT `period`, `wire_no_pcs1`, `wire_no_pcs2`, `wire_len_color_pcs1`, `wire_len_color_pcs2`, `cut_len_pcs1`, `cut_len_pcs2` ';
    sql += 'FROM `qc_percheck_cutwire` WHERE `job_id` = ? ';
    sql += 'AND `prod_id` = ? ';
    sql += 'AND `spec_id` = ? ';
    sql += 'AND `wire_no` = ? ';
    var inserts = [params.jobId, params.productId, params.specId, params.wireId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  //-----------------------------------------------------------------------
  //   裁線製程 - 儲存首中末資料到資料庫 - 
  //-----------------------------------------------------------------------
  insertCutWireData: function(req, res) {
    var data = req.body.data;
    console.log(data);
    var sql = 'INSERT INTO qc_percheck_cutwire (job_id, prod_id, spec_id, term_module, wire_no, period, wire_no_pcs1, wire_no_pcs2, wire_len_color_std, wire_len_color_pcs1, wire_len_color_pcs2, cut_len_std, cut_len_pcs1, cut_len_pcs2) '
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.jobId, data.productId, data.specId, data.termModule, data.wireId, data.period, data.wire_no_pcs1, data.wire_no_pcs2, data.wire_len_color_std, data.wire_len_color_pcs1, data.wire_len_color_pcs2, data.cut_len_std, data.cut_len_pcs1, data.cut_len_pcs2];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  // ===================================================
  //   端子製程 - 以品號、檢規序號取得線材名稱 - 
  // ===================================================
  getModule: function(req, res) {
    var params = req.query;
    console.log(params);
    var sql = 'SELECT part_no, module_left, module_right FROM cmap_line ';
    sql += 'WHERE prod_no = ? '
    sql += 'AND modify_date = (SELECT MAX(modify_date) FROM cmap_line WHERE prod_no = ?) ';
    sql += 'AND seq_no = ?'
    var inserts = [params.productId, params.productId, params.specId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  // ===================================================
  //   端子製程 - 以端子品號取得前後足寬高、拔脫力標準值 - 
  // ===================================================
  getModuleStd: function(req, res) {
    var params = req.query;
    console.log(params);
    var sql = 'SELECT ffoot_h, ffoot_w, bfoot_h, bfoot_w, pull_force FROM meta_list ';
    sql += 'WHERE term_model = ? ';
    sql += 'AND bound = 1 ';
    sql += 'AND result = 1'
    var inserts = [params.termModule];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  // ===================================================
  //   端子製程 - 以端子品號取得前後足寬高、拔脫力標準值 - 
  // ===================================================
  getPullForceStd: function(req, res) {
    var params = req.query;
    console.log(params);
    var sql = 'SELECT pullforce_kg, pullforce_newton, kg_max, kg_min, newton_max, newton_min FROM pull_force_std ';
    sql += 'WHERE wire_no = ? ';
    var inserts = [params.wireId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  // ==================================================================
  //   端子製程 - 以製令單別、品號、檢規序號、線材名稱取得最新的首中末資料 - 
  // ==================================================================
  getModulePeriodData: function(req, res) {
    var params = req.query;
    var sql = 'SELECT period, term_module_input_pcs1, term_module_input_pcs2, ffoot_h_pcs1, ffoot_h_pcs2, ';
    sql += 'ffoot_w_pcs1, ffoot_w_pcs2, bfoot_h_pcs1, bfoot_h_pcs2, bfoot_w_pcs1, bfoot_w_pcs2, pull_force_pcs1, pull_force_pcs2 '
    sql += 'FROM qc_percheck_module WHERE job_id = ? ';
    sql += 'AND prod_id = ? ';
    sql += 'AND spec_id = ? ';
    sql += 'AND term_module = ? ';
    sql += 'AND term_LR = ? ';
    sql += 'AND wire_no = ?';
    var inserts = [params.jobId, params.productId, params.specId, params.termModule, params.termLR, params.wireId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  //-----------------------------------------------------------------------
  //   端子製程 - 儲存首中末資料到資料庫 - 
  //-----------------------------------------------------------------------
  insertModuleData: function(req, res) {
    var data = req.body.data;
    console.log(data);
    var sql = 'INSERT INTO qc_percheck_module (job_id, prod_id, spec_id, term_module, term_LR, wire_no, period, term_module_input_pcs1, term_module_input_pcs2, ';
    sql += 'ffoot_h_std, ffoot_h_pcs1, ffoot_h_pcs2, ffoot_w_std, ffoot_w_pcs1, ffoot_w_pcs2, bfoot_h_std, bfoot_h_pcs1, bfoot_h_pcs2, bfoot_w_std, bfoot_w_pcs1, bfoot_w_pcs2, ';
    sql += 'pull_force_std, pull_force_pcs1, pull_force_pcs2) '
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.jobId, data.productId, data.specId, data.termModule, data.termLR, data.wireId, data.period, data.termModule_input_pcs1, data.termModule_input_pcs2, data.ffoot_h_std, data.ffoot_h_pcs1, data.ffoot_h_pcs2, data.ffoot_w_std, data.ffoot_w_pcs1, data.ffoot_w_pcs2, data.bfoot_h_std, data.bfoot_h_pcs1, data.bfoot_h_pcs2, data.bfoot_w_std, data.bfoot_w_pcs1, data.bfoot_w_pcs2, data.pull_force_std, data.pull_force_pcs1, data.pull_force_pcs2];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getPeriodData: function(req, res) {
    var params = req.query;
    console.log(params);
    var sql = 'SELECT * FROM qc_periodcheck WHERE `job_id` = ? ';
    sql += 'AND `prod_id` = ? AND `process_id` = ? ';
    sql += 'AND `spec_id` = ? AND `wire_no` = ? ';
    sql += 'AND `term_module` = ? AND `control_method` = ? AND `control_title` = ? ';
    var inserts = [params.jobId, params.productId, params.processId, params.specId, params.wireId, params.termModule, params.control_method, params.control_title];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  //-----------------------------------------------------------------------
  //   裁線端子製程 - 儲存首中末資料到資料庫 - 
  //-----------------------------------------------------------------------
  insertPeriodData: function(req, res) {
    var data = req.body.data;
    console.log(data);
    var sql = 'INSERT INTO qc_periodcheck (job_id, prod_id, process_id, spec_id, wire_no, term_module, term_module_LR, control_method, control_index, control_title, check_method,  period, staff_id, empower_staff_id,';
    sql += 'pcs1_period1, pcs2_period1, pcs1_period2, pcs2_period2, pcs1_period3, pcs2_period3, ispcs1NG_period1, ispcs2NG_period1, ispcs1NG_period2, ispcs2NG_period2, ispcs1NG_period3, ispcs2NG_period3) ';
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE pcs1_period1 = ?, pcs2_period1 = ?, pcs1_period2 = ?, pcs2_period2 = ?, pcs1_period3 = ?, pcs2_period3 = ?, '
    sql += 'ispcs1NG_period1 = ?, ispcs2NG_period1 = ?, ispcs1NG_period2 = ?, ispcs2NG_period2 = ?, ispcs1NG_period3 = ?, ispcs2NG_period3 = ?, period = ? '
    var inserts = [data.job_id, data.prod_id, data.process_id, data.spec_id, data.wire_no, data.term_module, data.term_module_LR, data.control_method, data.control_index, data.control_title, data.check_method, data.period, data.staffId, data.empowerStaffId,
                   data.pcs1_period1, data.pcs2_period1, data.pcs1_period2, data.pcs2_period2, data.pcs1_period3, data.pcs2_period3, data.ispcs1NG_period1, data.ispcs2NG_period1, data.ispcs1NG_period2, data.ispcs2NG_period2, data.ispcs1NG_period3, data.ispcs2NG_period3,
                   data.pcs1_period1, data.pcs2_period1, data.pcs1_period2, data.pcs2_period2, data.pcs1_period3, data.pcs2_period3, data.ispcs1NG_period1, data.ispcs2NG_period1, data.ispcs1NG_period2, data.ispcs2NG_period2, data.ispcs1NG_period3, data.ispcs2NG_period3, data.period] ;
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
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
  // =================================
  //      出貨成績書 - 取得檢規項目     
  // =================================
  getQualityInfo: function (req, res) {
    var params = req.query;
    var sql = 'SELECT quality_info FROM prod_ebom WHERE prod_no = ? ';
    sql += 'AND ver_no=(SELECT max(ver_no) FROM prod_ebom WHERE prod_no = ?)';
    var inserts = [params.productId, params.productId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getChangeRecord: function (req, res) {
    var params = req.query;
    var sql = 'SELECT record_sn, record_date, record_reason, record_result FROM qc_change_record WHERE prod_id = ?';
    var inserts = [params.productId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getShippingQuantity: function (req, res) {
    var params = req.query;
    var sql = 'SELECT ta015 FROM erp_mocta WHERE ta001 = ? AND ta002 = ? AND ta006 = ?';
    var inserts = [params.ta001,params.ta002,params.ta006];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getResultForm: function (req, res) {
    var params = req.query;
    var sql = 'SELECT * FROM qc_result_form WHERE prod_id = ? ';
    sql += 'AND form_ver=(SELECT max(form_ver) FROM qc_result_form WHERE prod_id = ?)';
    var inserts = [params.productId,params.productId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getSizeItem: function (req, res) {
    var params = req.query;
    var sql = 'SELECT * FROM qc_size_item WHERE prod_id = ? AND form_ver=(select max(form_ver) from qc_size_item WHERE prod_id = ?)';
    var inserts = [params.productId, params.productId];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  getImage: function (req, res) {
    var param = req.query
    var filePath = 'C:/Apache24/htdocs/mes/uploads/checkimage/'+param.fileName;
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
  // ==========================================
  //      製作出貨成績書 (不含測量值)     
  // ==========================================
  insertResultForm: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_result_form (prod_id, form_ver, regular_check, vendor_change, design_change, record_sn, record_date, record_reason, record_result, img_name, quality_info, q3_standard, q4_standard) ';
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.productId, data.form_ver, data.regularCheck, data.vendorChange, data.designChange, data.recordSN, data.recordDate, data.recordReason, data.recordResult, data.img_name, data.quality_info, data.q3_standard, data.q4_standard];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  insertChangeRecordData: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_change_record (prod_id, record_sn, record_date, record_reason, record_result) ';
    sql += 'VALUES(?,?,?,?,?)'
    var inserts = [data.productId, data.recordSN, data.recordDate, data.recordReason, data.recordResult];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  insertSizeItem: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_size_item (prod_id, form_ver, exam_sn, position, distance, upperbound, lowerbound) ';
    sql += 'VALUES(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE position = ?, distance = ?, upperbound = ?, lowerbound = ?'
    var inserts = [data.productId, data.form_ver, data.examSN, data.position, data.distance, data.upperbound, data.lowerbound, data.position, data.distance, data.upperbound, data.lowerbound];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  saveImg: function (req, res) {
    const form = new formdiable.IncomingForm()
    form.keepExtensions = true;
    form.on('file', (field, file) => {
      var targetDir = 'C:/Apache24/htdocs/mes/uploads/checkimage'
      var oldpath = file.path
      var newpath = targetDir+"/"+field
      /* move uploaded file from old path to new path */
      fs.rename( oldpath, newpath, function (err) {
        if (err) throw err
      })
    })
    form.parse(req)
  },
  // ==========================================
  //            儲存已完成之出貨成績書 
  // ==========================================
  insertResultData: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_result (job_id, prod_id, mfg_date, dispatch_date, shipping_quantity, regular_check, vendor_change, design_change, record_sn, record_date, record_reason, record_result, img_base64) ';
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.jobId, data.productId, data.mfgDate, data.dispatchDate, data.shippingQuantity, data.regularCheck, data.vendorChange, data.designChange, data.recordSN, data.recordDate, data.recordReason, data.recordResult, data.img_base64];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  insertStandardExamData: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_standard_exam (job_id, prod_id, mfg_date, quality_info_no, exam_value1, exam_value2, exam_value3, exam_value4, exam_value5, exam_value6, exam_value7, exam_value8, exam_value9, exam_value10, exam_value11,exam_value12) ';
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.jobId, data.productId, data.mfgDate, data.qualityInfoNo, data.exam_value1, data.exam_value2, data.exam_value3, data.exam_value4, data.exam_value5, data.exam_value6, data.exam_value7, data.exam_value8, data.exam_value9, data.exam_value10, data.exam_value11, data.exam_value12];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
  },
  insertSizeExamData: function(req, res){
    var data = req.body.data;
    var sql = 'INSERT INTO qc_size_exam (job_id, prod_id, mfg_date, exam_sn, position, distance, upperbound, lowerbound, exam_value1, exam_value2, exam_value3, exam_value4, exam_value5, exam_value6, exam_value7, exam_value8, exam_value9, exam_value10, exam_value11,exam_value12) ';
    sql += 'VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    var inserts = [data.jobId, data.productId, data.mfgDate, data.examSN, data.position, data.distance, data.upperbound, data.lowerbound, data.exam_value1, data.exam_value2, data.exam_value3, data.exam_value4, data.exam_value5, data.exam_value6, data.exam_value7, data.exam_value8, data.exam_value9, data.exam_value10, data.exam_value11, data.exam_value12];
    sql = mysql.format(sql, inserts);
    actionDB(pool, sql, res);
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