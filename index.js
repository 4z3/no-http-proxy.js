var http = require('http');
var https = require('https');
var pump = require('util').pump;


http.createServer(function (req, res) {

  delete req.headers.connection;
  req.headers.host = '194.127.208.119:8443';

  var options = {
    host: '194.127.208.119',
    port: 8443,
    path: '/fischerrfc/',
    method: 'POST',
    headers: req.headers
  };

  var preq = https.request(options, function(pres) {
    console.log("statuscode: ", pres.statusCode);
    console.log("headers: ", pres.headers);

    pres.on('data', function(chunk) {
      console.log('pres data:', chunk.toString());
      res.write(chunk.toString(), 'binary');
    });
    pres.on('end', function() {
      console.log('pres end.');
      res.end();
    });
    pres.on('close', function() {
      console.log('pres close.');
      res.end();
    });
    pres.on('error', function (err) {
      console.log('pres error:', err);
    });

    res.writeHead(pres.statusCode, pres.headers);
  });

  req.on('data', function(chunk) {
    console.log('preq data:', chunk.toString());
    preq.write(chunk.toString(), 'binary');
  });
  req.on('end', function() {
    console.log('preq end.');
    preq.end();
  });
}).listen(1337, function () {
  console.log('Server running at http://127.0.0.1:1337/');
});

//
//
//var req = https.request(options, function(res) {
//  console.log("statuscode: ", res.statuscode);
//  console.log("headers: ", res.headers);
//
//  res.on('data', function(d) {
//    process.stdout.write(d);
//  });
//});
//var x = JSON.stringify(
//{ "service": { "auth": { "user": "feser-c", "password": "kunden" }, "request": { "sap_credentials": { "password": "kunden", "user": "feser-c" }, "sap_function": "ZMCRM_SYSTEM_LOGIN", "IV_USER": "feser-c", "IV_PASSWORD": "kunden" } } }
//);
//var y = new (require('buffer').Buffer)(x);
//req.write(y, 'binary');
//req.end();
//
//req.on('error', function(e) {
//  console.error(e);
//});
