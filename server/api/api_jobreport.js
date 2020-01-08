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

  // 更新1個row的資料
  updateByKey: function (req, res) {
    var param = req.body.data
    console.log(param)
    var sql = 'UPDATE `fortop`.?? SET ?? = ?  WHERE ?? = ?'
    //var inserts = [param.schedule, param.modifyid, param.modifydate, param.originaldate]
    var inserts = [param.table, param.key1, param.key1value, param.key2, param.key2value]
    sql = mysql.format(sql, inserts)
    console.log(sql)
  
    actionDB(pool, sql, res)
  },

  updateByWhere: function (req, res) {
    var param = req.body.data
    console.log(param)
    var sql = 'UPDATE `fortop`.`job_report` SET `work_id` = ?, `info` = ?, `status` = ?, `work_user` = ?, `work_num` = ?, `working_user` = ? WHERE `work_id` = ?'
    var values = [param.work_id, param.info, param.status, param.work_user, param.work_num, param.working_user, param.work_id]
    sql = mysql.format(sql, values)
    //console.log(sql)
    actionDB(pool, sql, res)
  },

  queryByWhere: function (req, res) {
    var param = req.body.data
    //console.log(req.body.data)
    var sql = 'SELECT * FROM `fortop`.`job_report` WHERE `work_id` = ?'
    var inserts = [param.work_id]
    sql = mysql.format(sql, inserts)
    //console.log(sql)
    actionDB(pool, sql, res)
    //console.log(res.data)
  },

  insert_into: function (req, res) {
    var param = req.body.data
    //console.log(req.body.data)
    //console.log(res)
    var sql = 'INSERT INTO `job_report` ('
    sql += '`work_id`,`info`,`status`,`work_user`,`working_user`) VALUES ('
    sql += '?,?,?,?,?)'

    var inserts = [param.work_id, param.info, param.status, param.work_user, param.working_user]
    sql = mysql.format(sql, inserts)
    //console.log(sql)
    actionDB(pool, sql, res)
  },



  getWorkingUser: function (req, res) { //Mingzoo, 20191016
    var param = req.body.data
    var sql = 'SELECT working_user FROM job_report WHERE work_id = ?'
    var value = [param.work_id]
    sql = mysql.format(sql, value)
    actionDB(pool, sql, res)
  },

  /*
  updateWorkingUser: function (req, res) {
    var param = req.body.data
    var sql = 'UPDATE job_report SET working_user = ? WHERE work_id = ?'
    var values = [param.working_user, param.work_id]
    sql = mysql.format(sql, values)
    actionDB(pool, sql, res)
  },
  */

  ////////////////////////////////////////
  // for JobReport.vue
  getJobStatus: function (req, res) {
    var param = req.query;
    var values, sql;
    if (param.spec=='X')
    {
        values = [param.order_id, param.product_id, "%"+param.step+"%"];
        sql = "SELECT * FROM job_status WHERE order_id=? AND product_id=? AND line_id LIKE ?;"
    }
    else
    {
        values = [param.order_id, param.product_id, param.step, param.spec];
        sql = "SELECT * FROM job_status WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
    }
    sql = mysql.format(sql, values);
    console.log(sql);
    actionDB(pool, sql, res);
  },

  updateJobStatusNoQty: function (req, res) {
    var param = req.body.data;
	var values, sql;
	if (param.spec=='X')
	{
		values = [param.state, param.report_worker, param.log, param.order_id, param.product_id, "%"+param.step+"%"];
		sql = "UPDATE job_status SET state=?, report_worker=?, log=? \
                WHERE order_id=? AND product_id=? AND line_id LIKE ?;";
    }
	else
	{
		values = [param.state, param.report_worker, param.log, param.order_id, param.product_id, param.step, param.spec];
		sql = "UPDATE job_status SET state=?, report_worker=?, log=? \
                WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
	}
	sql = mysql.format(sql, values);
    //console.log(sql);
    actionDB(pool, sql, res);
  },
  
  updateJobStatusQty: function (req, res) {
    //console.log("updateJobStatusQty");
    var param = req.body.data;
	var values, sql;
	if (param.spec=='X')
	{
		values = [param.state, param.report_worker, param.log, param.acc_good, param.acc_ng, param.order_id, param.product_id, "%"+param.step+"%"];
		sql = "UPDATE job_status SET state=?, report_worker=?, log=?, acc_good=?, acc_ng=? \
				WHERE order_id=? AND product_id=? AND line_id LIKE ?;";
	}
	else
	{
		values = [param.state, param.report_worker, param.log, param.acc_good, param.acc_ng, param.order_id, param.product_id, param.step, param.spec];
		sql = "UPDATE job_status SET state=?, report_worker=?, log=?, acc_good=?, acc_ng=? \
				WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
	}

    sql = mysql.format(sql, values);
    //console.log(sql);
    actionDB(pool, sql, res);
  },
  
  updateJobCompletedTime: function (req, res) {
    var param = req.body.data;
	var values, sql;
	
	if (param.spec=='X')
	{	
		values = [param.order_id, param.product_id, "%"+param.step+"%"];
		sql = "UPDATE job_status SET report_end_time=CURRENT_TIMESTAMP() WHERE order_id=? AND product_id=? AND line_id LIKE ?;";
	}
	else
	{
		values = [param.order_id, param.product_id, param.step, param.spec];
		sql = "UPDATE job_status SET report_end_time=CURRENT_TIMESTAMP() WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
	}
    sql = mysql.format(sql, values);
    actionDB(pool, sql, res);
  },
  
  updateJobPrevStepState: function (req, res) {
    var param = req.body.data;
	var values, sql;
	if (param.spec=='X')
	{
		values = [param.prev_step_state, param.order_id, param.product_id, "%"+param.step+"%"];
		sql = "UPDATE job_status SET prev_step_state=? \
                WHERE order_id=? AND product_id=? AND line_id LIKE ?;";
	}
	else
	{
		values = [param.prev_step_state, param.order_id, param.product_id, param.step, param.spec];
		sql = "UPDATE job_status SET prev_step_state=? \
                WHERE order_id=? AND product_id=? AND step=? AND spec=?;";
	}
    sql = mysql.format(sql, values);
    actionDB(pool, sql, res);
  },
}
