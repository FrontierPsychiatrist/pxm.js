var config = require('./config');
var express = require('express');
var pxm = express();

var mysql      = require('mysql2');
var db = mysql.createConnection({ 
  host: config.database.url,
  port: config.database.port, 
  user: config.database.username, 
  password: config.database.password,
  database: config.database.database
});

db.connect(function(err) {
  if(err) {
    console.log(err);
    exit(1);
  }
});

/**
 * This method returns value if it is not undefined, default otherwise
 **/
function defaultValue(value, _default) {
  return typeof value !== 'undefined' ? value : _default;
}

/**
 * Creates an array consisting of one object for each row, having all the fields
 * in the field array. The two leading characters of the field names are stripped
 **/
function arrayWithAllFields(rows, fields) {
  var ret = [];
  for(var i = 0; i < rows.length; i++) {
    var obj = {};
    for(var j = 0; j < fields.length; j++) {
      obj[fields[j].name.substr(2)] = rows[i][fields[j].name];
    }
    ret.push(obj);
  };
  return ret;
}

function objectWithAllFields(rows, fields) {
  if(rows.length > 1) {
    new Error('Only useable with maximum 1 object');
  }
  var obj = {};
  for(var j = 0; j < fields.length; j++) {
    obj[fields[j].name.substr(2)] = rows[0][fields[j].name];
  }
  return obj;
}

function standardReturn(err, rows, fields, res, mapper) {
  if(err) {
    res.send(err.message);
    return;
  }
  var body = mapper(rows, fields);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(body);
}

pxm.get('/api/1', function(req, res) {
  res.send(pxm.routes);
});

pxm.get('/api/1/board/list', function(req, res, next) {
  db.query('SELECT b_id, b_name, b_description, b_position, b_active FROM pxm_board', function(err, rows, fields) {
    standardReturn(err, rows, fields, res, arrayWithAllFields);
  });
});

/**
 * Parameter:
 *  ?sort=[name, activity]
 *  ?limit=\d+
 *  ?offset=\d+
 **/
pxm.get('/api/1/board/:boardid/threads', function(req, res, next) {
  var orderBy = {name: 't_name ASC', activity: 't_lastmsgtstmp DESC'};
  var sort = defaultValue(orderBy[req.query.sort], 't_lastmsgtstmp DESC');
  var limit = defaultValue(req.query.limit, 50);
  var offset = defaultValue(req.query.offset, 0);
  db.execute('SELECT m_subject AS t_name, t_lastmsgtstmp, t_id, t_active, t_fixed, t_msgquantity, t_boardid ' +
    'FROM pxm_thread JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0 WHERE t_boardid = ? ORDER BY ' + sort + ' LIMIT ?,?', 
    [req.params.boardid, offset, limit], 
    function(err, rows, fields) {
      standardReturn(err, rows, fields, res, arrayWithAllFields);
    });
});

pxm.get('/api/1/thread/:threadid', function(req, res, next) {
  db.execute('SELECT t_id, m_subject AS t_name, t_lastmsgtstmp, t_active, t_fixed, t_msgquantity, t_boardid ' +
    'FROM pxm_thread JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0 WHERE t_id = ?',
    [req.params.threadid],
    function(err, rows, fields) {
      standardReturn(err, rows, fields, res, objectWithAllFields);
    });
});

pxm.get('/api/1/thread/:threadid/messages', function(req, res, next) {
  db.execute('SELECT m_id, m_subject, m_usernickname, m_tstmp, m_parentid FROM pxm_message WHERE m_threadid = ?',
    [req.params.threadid], 
    function(err, rows, fields) {
      standardReturn(err, rows, fields, res, arrayWithAllFields);
    });
});

pxm.get('/api/1/message/:messageid', function(req, res, next) {
  db.execute('SELECT m_id, m_threadid, m_usernickname, m_subject, m_body, m_tstmp FROM pxm_message WHERE m_id = ?',
    [req.params.messageid],
    function(err, rows, fields) {
      standardReturn(err, rows, fields, res, objectWithAllFields);
    });
});

pxm.listen(8080);
