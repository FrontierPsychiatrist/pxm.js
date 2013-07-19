var express = require('express');
var pxm = express();

pxm.get('/', function(req, res) {
  var body = 'PXM.JS';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});


pxm.listen(8080);
