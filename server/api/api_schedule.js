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
  queryBetween: function (req, res) {
    var param = req.query
    var sql = 'SELECT `schedule`,`modify_id`,`modify_date` FROM `fortop`.`schedule_list` WHERE `modify_date` >= ? AND `modify_date` <= ?'
    var inserts = [param.column, param.end]
    sql = mysql.format(sql, inserts)
    
    actionDB(pool, sql, res)
  },
  
  // 查詢某資料表中的最新一筆欄位資料
  queryLatest: function (req, res) {
    var sql = 'SELECT `schedule`,`ca1`,`modify_id`,`modify_date` FROM `fortop`.`schedule_list` ORDER BY `modify_date` DESC LIMIT 1'
    
    actionDB(pool, sql, res)
  },

  //-----------------------------------------------------------------------
  // 製程資料操作
  //-----------------------------------------------------------------------

  // 更新1個row的資料
  updateByWhere: function (req, res) {
    //var param = req.query
    //console.log(req)
    var param = req.body.data
    //console.log(param)
    //console.log(param.schedule)
    console.log(param.modifyid)
    console.log(param.modifyDate)
    console.log(param.originaldate)
    var sql = 'UPDATE `fortop`.`schedule_list` SET `schedule` = ?,`modify_id` = ?,`modify_date` = ? WHERE `modify_date` = ?'
    //var inserts = [param.schedule, param.modifyid, param.modifydate, param.originaldate]
    var inserts = [param.schedule, param.modifyid, param.modifyDate, param.originaldate]
    sql = mysql.format(sql, inserts)
    // console.log(sql)
  
    actionDB(pool, sql, res)
  },
  
  // 刪除某筆資料，根據一組WHERE條件
  deleteByWhere: function (req, res) {
    var param = req.query
    var sql = 'DELETE FROM `fortop`.`schedule_list` WHERE `modify_date` = ?'
    var inserts = [param.modifydate]
    sql = mysql.format(sql, inserts)

    actionDB(pool, sql, res)
  },

  getCandidateJobs: function (req, res) {   //Mingzoo, 20191027
    //console.log("API: getCandidateJobs()")
    var param = req.query;
    var jobType = [param.job_type];
    //console.log(jobType)
    /*var sql = "SET @jobType = " + jobType + "; \
               SELECT * FROM job_status WHERE state!='4' AND (prev_step_state='4' OR prev_step=-1 OR prev_step IS NULL) \
                          AND (mocta_state!='y' AND mocta_state!='Y' OR mocta_state IS NULL) \
                          AND due_date >= CURRENT_DATE() \
                          AND job_type=@jobType \
                          ORDER BY due_date;";
    */
    var sql = "SELECT * FROM job_status WHERE state!='4' AND (prev_step_state='4' OR prev_step=-1 OR prev_step IS NULL) \
                          AND (mocta_state!='y' AND mocta_state!='Y' OR mocta_state IS NULL) \
                          AND due_date >= CURRENT_DATE() \
                          AND job_type LIKE '" + jobType + "' \
                          ORDER BY due_date;";
    //var sql = "SELECT * FROM job_status WHERE prev_step=-1;";
    //sql = mysql.format(sql, jobType);
    //console.log(sql);
    actionDB(pool, sql, res);
  },



  ////////////////////////////////////////////////////////////////////////////////
  //for SchSettingRun.vue
  getSchSetting: function (req, res) {  //Mingzoo, 20191101
    var sql = "SELECT * FROM schedule_parameter \
                WHERE save_time = (SELECT MAX(save_time) FROM schedule_parameter)";
    actionDB(pool, sql, res);
  },

  saveSchSetting: function (req, res) {
    var param = req.body.data;
    var values = [param.day1, param.nof_preSamWorkers, param.nof_samWorkers];
    var sql = "INSERT INTO schedule_parameter SET day1=?, nof_preSamWorkers=?, nof_samWorkers=?";
    sql = mysql.format(sql, values);
    actionDB(pool, sql, res);
  },



  ////////////////////////////////////////////////////////////////////////////////
  //for SchResult.vue
  getSchResult: function (req, res) {
    var param = req.query;
    var values = [param.job_type];
    var sql = "SELECT *, CONCAT(step, ', ', spec) AS step_spec, \
                    CONCAT(acc_good, ' / ', target_qty, ' (', FLOOR(100 * acc_good / target_qty), '%)') AS progress \
                FROM job_assignment \
                WHERE job_type=? ORDER BY start_time";

    sql = mysql.format(sql, values);
    actionDB(pool, sql, res);
  },

  getAutoMachines: function (req, res) {
    var sql = "SELECT DISTINCT machine FROM job_assignment_stat WHERE machine != '-1' ORDER BY machine";
    actionDB(pool, sql, res);
  },
  
  getAmJobAssignments: function (req, res) {
    var sql = "SELECT machine, todo_qty, start_time, end_time, exe_time, wire_id, wire_color, \
                ft_left, ft_right FROM job_assignment_stat ORDER BY machine, start_time";
    actionDB(pool, sql, res);
  },



  ////////////////////////////////////////////////////////////////////////////////
  //for SchPorgress.vue
  getOrders: function (req, res) {
    var sql = "SELECT DISTINCT \
                    order_id, product_id, target_qty, open_date, due_date, \
                    CONCAT('(', customer_id, ') ', customer_name)AS customer_info \
                FROM job_status \
                WHERE due_date>=CURRENT_DATE() AND target_qty > 0 \
                ORDER BY due_date";
    actionDB(pool, sql, res);
  },

  getSchProgress: function (req, res) {
    var param = req.query;
    var values = [param.job_type];
    /*var sql = "SELECT job_status.order_id, job_status.product_id, \
                    job_assignment.worker, job_assignment.machine, job_assignment.start_time, job_assignment.end_time, \
                    job_status.state, job_status.wrapup_state, \
                    CONCAT(job_status.step, ', ', job_status.spec) AS step_spec, \
                    CONCAT(job_status.wire_id, ', ', job_status.wire_length, ', ', job_status.wire_color) AS wire_info, \
                    CONCAT(job_status.acc_good, ' / ', job_status.target_qty, ' (', FLOOR(100 * job_status.acc_good / job_status.target_qty), '%)') AS progress \
                FROM \
                    job_assignment \
                JOIN \
                    job_status USING (order_id , product_id , step , spec) \
                WHERE \
                    job_status.target_qty > 0 AND \
                    job_assignment.job_type = ? \
                ORDER BY job_status.due_date";*/
    /*var sql = "SELECT job_status.order_id, job_status.product_id, \
                    job_assignment.worker, job_assignment.machine, job_assignment.end_time, \
                    job_status.state, job_status.wrapup_state, \
                    job_status.step, job_status.spec, CONCAT(job_status.step, ', ', job_status.spec) AS step_spec, \
                    job_status.wire_id, \
                    CONCAT(job_status.wire_id, ', ', job_status.wire_length, ', ', job_status.wire_color) AS wire_info, \
                    CONCAT(job_status.acc_good, ' / ', job_status.target_qty, ' (', FLOOR(100 * job_status.acc_good / job_status.target_qty), '%)') AS progress, \
                    job_status.report_end_time \
                FROM \
                    job_status \
                JOIN \
                    job_assignment USING (order_id , product_id , step , spec) \
                WHERE \
                    job_status.target_qty > 0 AND \
                    job_assignment.job_type = ? \
                ORDER BY job_status.due_date";*/
    var sql = "SELECT *, CONCAT(step, ', ', spec) AS step_spec, \
                    CONCAT(wire_id, ', ', wire_length, ', ', wire_color) AS wire_info, \
                    CONCAT(acc_good, ' / ', target_qty, ' (', FLOOR(100 * acc_good / target_qty), '%)') AS progress \
                FROM job_status \
                WHERE \
                    job_type = ? AND (mocta_state!='y' OR mocta_state!='Y') AND \
                    ((worker!='' OR machine!='') OR (state='已出站' AND wrapup_state='未撿線') OR \
                    (state='已出站' AND wrapup_state='已撿線'))";// AND due_date>=CURRENT_DATE()))";
    sql = mysql.format(sql, values);
    actionDB(pool, sql, res);
  },

  updateWrapupState: function (req, res) {
    var param = req.body.data;
    var values = [param.wrapup_state, param.order_id, param.product_id, param.step, param.spec];
    var sql = "UPDATE job_status SET wrapup_state=? WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
    sql = mysql.format(sql, values);
	console.log(sql);
    actionDB(pool, sql, res);
  },



  ////////////////////////////////////////////////////////////////////////////////
  //for SchErrorMsg.vue
  getDelayOrders: function (req, res) {
    var sql = "SELECT DISTINCT order_id, product_id, target_qty, open_date, due_date, \
                    CONCAT('(', customer_id, ') ', customer_name) AS customer_info FROM job_status \
                WHERE due_date < CURRENT_DATE() \
                AND (mocta_state!='y' OR mocta_state!='Y') ORDER BY due_date;";
    actionDB(pool, sql, res);
  },
  
  getDueTodayOrders: function (req, res) {
    var sql = "SELECT DISTINCT order_id, product_id, target_qty, open_date, due_date, \
                    CONCAT('(', customer_id, ') ', customer_name) AS customer_info FROM job_status \
                WHERE due_date=CURRENT_DATE() \
                AND (mocta_state!='y' OR mocta_state!='Y');";
    actionDB(pool, sql, res);
  },
  
  getDueTomorrowOrders: function (req, res) {
    var sql = "SELECT DISTINCT order_id, product_id, target_qty, open_date, due_date, \
                    CONCAT('(', customer_id, ') ', customer_name) AS customer_info FROM job_status \
                WHERE due_date=ADDDATE(CURRENT_DATE(), INTERVAL 1 DAY) \
                AND (mocta_state!='y' OR mocta_state!='Y');";
     actionDB(pool, sql, res);
  },
  
  getErrorMsg: function (req, res) {
    var sql = "SELECT *, CONCAT('(', process_id, ') ', process_name) AS process_info FROM job_description WHERE LENGTH(error_msg) > 2";
    actionDB(pool, sql, res);
  },
  
  getOrderNoPP: function (req, res) {
    var sql = "SELECT DISTINCT ta006 AS product_id FROM erp_mocta \
                WHERE ta006 NOT IN (SELECT product_id FROM product_process)";
    actionDB(pool, sql, res);
  },

}
