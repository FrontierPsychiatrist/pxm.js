#!/usr/bin/env node
"use strict";
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

/**
 * Standard return for a GET method. Either sends an object or an array (parameter useArray)
 * @param err A JavaScript Error object that may have occured
 * @param rows The rows to return in the response
 * @param res The http response object
 * @param useArray if true, all rows will be sent. Otherwise only the first row will be sent. Be careful, only
 *  use useArray = true if you are sure there is only one row, otherwise nothing will be sent! 
 **/
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

/**
 * Check if the given username and password are valid and then call either a success or error callback
 * @param success A callback to be called when the login is possible with the given data. It will be called with the
 *  selected userdata.
 * @param error A callback to be called when the login was errornous.
 **/
function checkLogin(username, password, success, error) {
  var md5 = crypto.createHash('md5');
  md5.update(password);
  var hashedPassword = md5.digest('hex');
  db.execute('SELECT u_id, u_nickname FROM pxm_user WHERE u_nickname = ? AND u_password = ?',
    [username, hashedPassword],
    function(err, rows) {
    if(err) {
      throw err;
    } else {
      if(rows.length !== 1) {
        error();
      } else {
        success(rows[0]);
      }
    }
  });
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
  var success = function(userdata) {
    req.session.authenticated = true;
    req.session.userid = userdata.u_id;
    req.session.nickname = userdata.u_nickname;
    res.send(200);
  };
  var error = function() {
    res.send(401);
  };
  if(req.body.username && req.body.password) {
    checkLogin(req.body.username, req.body.password, success, error);
  } else {
    res.send(400, 'Please provide the username and password parameter');
  }
});

pxm.post('/api/1/logout', function(req, res, next) {
  req.session = null;
  res.send(200);
});

/**
 * Create a thread
 **/
pxm.post('/api/1/board/:boardid/thread', function(req, res, next) {
  var post = function() {
    //TODO: required params checking
    db.execute('INSERT INTO pxm_thread (t_boardid, t_active, t_lastmsgtstmp VALUES (?,?,?)',
    [req.params.boardid, 1, new Date().getTime()],
    function(err, result) {
      if(err) {
        res.send(500, err.message);
      } else {
        db.execute('INSERT INTO pxm_message ' +
          '(m_threadid,m_parentid,m_userid,m_usernickname,m_usermail,m_userhighlight,m_subject,m_body,m_tstmp,m_ip,m_notification)',
          'VALUES (?,?,?,?,?,?,?,?,?,?,?)',
          [result.insertId, req.body.parent_id, 'username?', 'usermail?', 'userhighlight?',
            req.body.subject, req.body.body, new Date().getTime(), 'ip?', req.body.notification],
          function(err, mResult) {
            if(err) {
              //TODO delete from pxm_thread
              res.send(500);
            } else {
              db.execute('UPDATE pxm_board SET b_lastmsgtstmp = ? WHERE b_id = ?',
                ['msgtstmp', req.params.boardid], function(err, response) {
                  if(err) {
                    //TODO: delete thread and message
                    res.send(500);
                  } else {
                    res.send(200);
                  }
                });
            } //if error insert pxm_message
          }); //insert into pxm_message
      } //if error inser pxm_thread
    }); //insert into pxm_thread
  };
  
  var error = function() {
      res.send(401);
  };
  //TODO: post allowed?
  //TODO: badwords
  //TODO: html escaping
  if(!req.session || !req.session.authenticated) {
    if(req.body.username && req.body.password) {
      checkLogin(req.body.user, req.body.password, post, error);
    } else {
      error();
    }
  } else {
    post();
  }
  //messagecount fuer user erhoehen
});

/**
 * Post an answer in a thread
 **/
pxm.post('/api/1/thread/:threadid/message', function(req, res, next) {
  //if not logged in, use provided logindata
  //post allowed?
  //badwords
  ///html escaping
/*
  INSERT INTO pxm_message (m_threadid,m_parentid,m_userid,m_usernickname,m_usermail,m_userhighlight,m_subject,m_body,m_tstmp,m_ip,m_notification)
  UPDATE pxm_thread SET t_lastmsgtstmp=$this->m_iMessageTimestamp,t_lastmsgid=$this->m_iId,t_msgquantity=t_msgquantity+1 WHERE t_id=$this->m_iThreadId
  UPDATE pxm_board SET b_lastmsgtstmp=$this->m_iMessageTimestamp WHERE b_id=$this->m_iBoardId

  //Wenn autoclose und messagelimit erreicht
  UPDATE pxm_thread SET t_active=0 WHERE t_id=$this->m_iThreadId AND t_msgquantity>=$iAutoClose
*/
  //messagecount fuer user erhoehen
  //reply notification
});

pxm.listen(8080);
