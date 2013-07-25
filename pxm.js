#!/usr/bin/env node
"use strict";
var config = require('./config.json');
var BadWordFilter = require('./BadWordFilter');
var crypto = require('crypto');
var express = require('express');
var auth = require('./authentication.js');

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

var mysql = require('mysql');
var connectionPool = mysql.createPool({

    host:       config.database.url,
    port:       config.database.port,
    user:       config.database.username,
    password:   config.database.password,
    database:   config.database.database,
    multipleStatements: true
});

var badWordFilter = null;
connectionPool.getConnection(function(error, connection){

    if(error) throw error;
    badWordFilter = new BadWordFilter(connection);
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
        res.send(500, {message:'Internal Server Error'});
        throw err;
    } else {

        var body = [];
        if(useArray) {
            body = rows;
        } else if(rows.length === 1) {
            body = rows[0];
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(body);
    }
}

pxm.get('/api/1', function(req, res) {
  res.send(pxm.routes);
});

pxm.get('/api/1/board/list', function(req, res, next) {
    connectionPool.getConnection( function (error, connection){

        if(error) throw error;
        var stmnt = 'SELECT b_id, b_name, b_description, b_position, b_active\n' +
                    '  FROM pxm_board\n' +
                    ' ORDER BY b_position ASC';

        connection.query(stmnt, function(err, rows, fields) {
            connection.end();
            standardReturn(err, rows, res, true);
        });
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

    connectionPool.getConnection( function(error, connection) {

        if(error) throw error;

        var stmnt = 'SELECT m_subject AS t_name, t_lastmsgtstmp, t_id, t_active,\n' +
                    '       t_fixed, t_msgquantity, t_boardid\n' +
                    '  FROM pxm_thread\n' +
                    '  JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0\n' +
                    ' WHERE t_boardid = ?\n' +
                    ' ORDER BY ' + connection.escape(sort) + ' LIMIT ?,?';

        connection.execute(stmnt, [req.params.boardid, offset, limit],
            function(err, rows, fields) {
                connection.end();
                standardReturn(err, rows, res, true);
        });
    });
});

/**
* Get thread by ID
**/
pxm.get('/api/1/thread/:threadid', function(req, res, next) {

    connectionPool.getConnection( function(error, connection) {

        if(error) throw error;
        var stmnt = 'SELECT t_id, m_subject AS t_name, t_lastmsgtstmp,\n' +
                    '       t_active, t_fixed, t_msgquantity, t_boardid\n' +
                    '  FROM pxm_thread\n' +
                    '  JOIN pxm_message ON t_id = m_threadid AND m_parentid = 0\n' +
                    ' WHERE t_id = ?';

        connection.query(stmnt, [req.params.threadid], function(err, rows, fields) {
            connection.end();
            standardReturn(err, rows, res, false);
        });
    });
});

/**
* Get messages of given thread
*/
pxm.get('/api/1/thread/:threadid/message/list', function(req, res, next) {

    connectionPool.getConnection( function(error, connection) {

        if(error) throw error;
        var stmnt = 'SELECT m_id, m_subject, m_usernickname, m_tstmp, m_parentid\n' +
                    '  FROM pxm_message\n' +
                    ' WHERE m_threadid = ?';

        connection.query(stmnt, [req.params.threadid], function(err, rows, fields) {
            connection.end();
            standardReturn(err, rows, res, true);
        });
    });
});

/**
* Get message by ID
*/
pxm.get('/api/1/message/:messageid', function(req, res, next) {

    connectionPool.getConnection( function(error, connection) {

        if(error) throw error;
        var stmnt = 'SELECT m_id, m_threadid, m_usernickname, m_subject, m_body, m_tstmp\n' +
                    '  FROM pxm_message\n' +
                    ' WHERE m_id = ?';

        connection.query(stmnt, [req.params.messageid], function(err, rows, fields) {
            connection.end();
            standardReturn(err, rows, res, false);
        });
    });
});

/**
* Log in with username and password.
*/
pxm.post('/api/1/login', function(req, res, next) {

    var ip = req.connection.remoteAddress;
    var username = req.body.username || '';
    var password = req.body.password || '';

    auth.authenticateUser(username, password, ip, function(err, user) {

        if(err) {
            res.send(401);
            return;
        }

        req.session.userId = user.u_id;
        req.session.accessToken = user.accessToken;
        res.send(200, {userId: user.u_id, accessToken: user.accessToken});
    });
});

pxm.post('/api/1/logout', function(req, res, next) {
  auth.logoutUser( req.session.userId )
  req.session = null;
  res.send(200);
});

/**
 * Create a thread
 * Required parameters:
 *  subject, body, notification
 * optional parameters:
 *  username, password
 **/
pxm.post('/api/1/board/:boardid/thread', function(req, res, next) {

    connectionPool.getConnection( function(error, connection) {

        if(error) throw error;
        var boardId = connection.escape(req.params.boardid);
        var timestamp = connection.escape(new Date().getTime() / 1000);
        // TODO: get user data & authentication
        var userId =  connection.escape(1);
        var username =  connection.escape('Developer');
        var usermail =  connection.escape('mail@example.com');
        var userhighlight = 1;
        var filteredBody =  connection.escape( badWordFilter.replaceBadWords(req.body.body) );
        var filteredSubject = connection.escape( badWordFilter.replaceBadWords(req.body.subject) );
        var userIP =  connection.escape('127.0.0.1');
        var notification = connection.escape( req.body.notification );

        var insertStmnt = 'BEGIN;\n' +
                          'INSERT INTO pxm_thread (t_boardid, t_active, t_lastmsgtstmp)\n' +
                          'VALUES (' + boardId + ',1,' + timestamp + ');\n' +
                          'UPDATE pxm_board SET b_lastmsgtstmp = ' + timestamp +
                          ' WHERE b_id = ' + boardId + ';\n' +
                          'INSERT INTO pxm_message (m_threadid, m_parentid, m_userid, m_usernickname, \n' +
                          '                         m_usermail, m_userhighlight, m_subject, m_body, \n' +
                          '                         m_tstmp, m_ip, m_notification)\n' +
                          'VALUES (LAST_INSERT_ID(),0,' + userId + ',' + username + ',' +
                                    usermail + ',' + userhighlight + ',' + filteredSubject + ',' + filteredBody + ',' +
                                    timestamp + ',' + userIP + ','  + notification + ');\n' +
                          'COMMIT;';

        connection.query(insertStmnt, function (error, result) {

            connection.end();
            if(error) {
                res.send(500, {message: '500 Internal Server Error'});
                throw error;
            }
            res.send(200, {message:'200 OK'});
        });
    });
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

pxm.listen(config.server.port, config.server.hostname);
