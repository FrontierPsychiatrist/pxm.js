"use strict";
var config = require('./config.json');
var crypto = require('crypto');
var mysql = require('mysql');
var connectionPool = mysql.createPool({

    host:       config.database.url,
    port:       config.database.port,
    user:       config.database.username,
    password:   config.database.password,
    database:   config.database.database,
    multipleStatements: true
});

var loggedInUsers = {};

/**
* create an access token.
*/
function createAccessToken(username, ip, logInDate, callback)
{
    console.log('ip=' + ip + ' username=' + username);
    var hash = crypto.createHash('sha1');
    hash.update(username);
    hash.update(ip);
    hash.update(logInDate);
    crypto.randomBytes(16, function(error, buffer) {

        if(error) throw error;
        var secret = buffer.toString('hex');
        hash.update(secret);
        callback( hash.digest('hex'), secret );
    });
}

/**
* @public
* @param username
* @param password
* @param {function} callback error, userId
*/
module.exports.authenticateUser = function (username, password, ip, callback) {

    var md5 = crypto.createHash('md5');
    md5.update(password);
    var hashedPassword = md5.digest('hex');

    var stmnt = 'SELECT u_id, u_nickname, u_publicmail, u_highlight\n' +
                '  FROM pxm_user\n' +
                ' WHERE u_nickname = ? AND u_password = ?\n';
    connectionPool.getConnection( function (error, connection) {

        if(error) throw error;
        connection.query(stmnt, [username, hashedPassword], function(err, rows) {

            connection.end();
            if(err) throw err;
            if(rows.length !== 1) {

                callback(new Error('Unknown user'), null);
            } else {

                var user = rows[0];
                user.logInDate = new Date().toISOString();
                createAccessToken(user.u_nickname, ip, user.logInDate, function(token, secret) {

                    user.accessToken = token;
                    user.secret = secret;
                    user.id = user.u_id;
                    loggedInUsers[ user.u_id ] = user;
                    callback(null, user);

                });
            }
        });
    });
}

/**
* @public
* @param {number} userId
*/
module.exports.logoutUser = function (userId) {
    delete loggedInUsers[ userId ];
}

/**
* @public
* @return {bool} Returns user object if token is valid, null otherwise.
*/
module.exports.isAccessTokenValid = function (userId, token, ip) {

    for(var user in loggedInUsers)
    {
        if(user.id === userId)
        {
            var hash = crypto.createHash('sha1');
            hash.update(user.u_nickname);
            hash.update(ip);
            hash.update(user.logInDate);
            hash.update(user.secret);

            if(hash.digest('hex') === token) return user;
        }
    }

    return null;
}
