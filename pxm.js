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

pxm.get('/', function(req, res) {
  res.send(pxm.routes);
});

pxm.get('/boards', function(req, res) {
  var body = [];
  db.query('SELECT * FROM pxm_board', function(err, rows, fields) {
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


pxm.listen(8080);
