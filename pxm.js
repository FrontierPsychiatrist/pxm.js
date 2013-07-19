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

pxm.get('/', function(req, res) {
  res.send(pxm.routes);
});

pxm.get('/api/1/boards', function(req, res) {
  db.query('SELECT b_id, b_name, b_description FROM pxm_board', function(err, rows, fields) {
    var body = [];
    for(var i = 0; i < rows.length; i++) {
      body.push({
        id: rows[i].b_id,
        name: rows[i].b_name,
        description: rows[i].b_description
      });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(body);
  });
});

/**
 * Parameter:
 *  ?sort=[name, activity]
 *  ?limit=\d+
 *  ?offset=\d+
 **/
pxm.get('/api/1/:boardid/threads', function(req, res) {
  var orderBy = {name: 't_name ASC', activity: 't_lastmsgtstmp DESC'};
  var sort = defaultValue(orderBy[req.query.sort], 't_lastmsgtstmp DESC');
  var limit = defaultValue(req.query.limit, 50);
  var offset = defaultValue(req.query.offset, 0);
  db.execute('SELECT m_subject AS t_name, t_lastmsgtstmp, t_id,t_active, t_fixed, t_msgquantity FROM pxm_thread JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0 WHERE t_boardid = ? ORDER BY ' + sort + ' LIMIT ?,?', [req.params.boardid, offset, limit], function(err, rows, fields) {
    var body = [];
    for(var i = 0; i < rows.length; i++) {
      body.push({
        id: rows[i].t_id,
        name: rows[i].t_name
      });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(body);
  });
});

pxm.listen(8080);
