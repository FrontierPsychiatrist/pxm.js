var config = require('./config');
var crypto = require('crypto');
var express = require('express');

var pxm = express();
pxm.configure(function() {
  pxm.use(express.bodyParser());
  pxm.use(express.cookieParser());
  pxm.use(express.cookieSession({
    secret: 'sklfjgj404ojsjgkfpeßw0jgs',
    cookie: {
      maxAge: 60*60*24*10
    }
  }));
});

var mysql = require('mysql2');
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
    process.exit(1);
  }
});

/**
 * This method returns value if it is not undefined, default otherwise
 **/
function defaultValue(value, _default) {
  return typeof value !== 'undefined' ? value : _default;
}

function standardReturn(err, rows, res, useArray) {
  if(err) {
    res.send(500, err.message);
  } else {
    var body = undefined;
    if(useArray) {
      body = rows;
    } else if(rows.length === 1) {
      body = rows[0];
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(body);
  }
}

pxm.get('/api/1', function(req, res) {
  res.send(pxm.routes);
});

pxm.get('/api/1/board/list', function(req, res, next) {
  db.query('SELECT b_id, b_name, b_description, b_position, b_active FROM pxm_board ORDER BY b_position ASC', function(err, rows, fields) {
    standardReturn(err, rows, res, true);
  });
});

/**
 * Parameter:
 *  ?sort=[name, activity]
 *  ?limit=\d+
 *  ?offset=\d+
 **/
pxm.get('/api/1/board/:boardid/thread/list', function(req, res, next) {
  var orderBy = {name: 't_name ASC', activity: 't_lastmsgtstmp DESC'};
  var sort = defaultValue(orderBy[req.query.sort], 't_lastmsgtstmp DESC');
  var limit = defaultValue(req.query.limit, 50);
  var offset = defaultValue(req.query.offset, 0);
  db.execute('SELECT m_subject AS t_name, t_lastmsgtstmp, t_id, t_active, t_fixed, t_msgquantity, t_boardid ' +
    'FROM pxm_thread JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0 WHERE t_boardid = ? ORDER BY ' + sort + ' LIMIT ?,?', 
    [req.params.boardid, offset, limit], 
    function(err, rows, fields) {
      standardReturn(err, rows, res, true);
    });
});

pxm.get('/api/1/thread/:threadid', function(req, res, next) {
  db.execute('SELECT t_id, m_subject AS t_name, t_lastmsgtstmp, t_active, t_fixed, t_msgquantity, t_boardid ' +
    'FROM pxm_thread JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0 WHERE t_id = ?',
    [req.params.threadid],
    function(err, rows, fields) {
      standardReturn(err, rows, res, false);
    });
});

pxm.get('/api/1/thread/:threadid/message/list', function(req, res, next) {
  db.execute('SELECT m_id, m_subject, m_usernickname, m_tstmp, m_parentid FROM pxm_message WHERE m_threadid = ?',
    [req.params.threadid], 
    function(err, rows, fields) {
      standardReturn(err, rows, res, true);
    });
});

pxm.get('/api/1/message/:messageid', function(req, res, next) {
  db.execute('SELECT m_id, m_threadid, m_usernickname, m_subject, m_body, m_tstmp FROM pxm_message WHERE m_id = ?',
    [req.params.messageid],
    function(err, rows, fields) {
      standardReturn(err, rows, res, false);
    });
});

pxm.post('/api/1/login', function(req, res, next) {
  var md5 = crypto.createHash('md5');
  md5.update(req.body.password);
  var hashedPassword = md5.digest('hex');
  db.execute('SELECT u_id, u_nickname FROM pxm_user WHERE u_nickname = ? AND u_password = ?',
    [req.body.username, hashedPassword],
    function(err, rows) {
      if(err) {
        res.send(500);
      } else {
        if(rows.length !== 1) {
          res.send(403);
        } else {
          req.session.authenticated = true;
          req.session.userid = rows[0].u_id;
          req.session.nickname = rows[0].u_nickname;
          res.send(200);
        }
      }
    });
});

pxm.post('/api/1/logout', function(req, res, next) {
  req.session = null;
  res.send(200);
});

pxm.listen(8080);
