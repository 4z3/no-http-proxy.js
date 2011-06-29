var http = require('http');
var https = require('https');

var pump = require('./node.util.pump').pump;

var filename = __dirname + '/proxy-table.json';
var table = JSON.parse(require('fs').readFileSync(filename));

http.createServer(function (req, res) {

  var match = /^\/([^\/]+)(.*)$/.exec(req.url);
  var proxyAlias = match[1];
  if (proxyAlias in table) {
    var baseUrl = table[proxyAlias];
    var url = baseUrl + match[2];

    var parsed_baseUrl = require('url').parse(baseUrl);

    var protocol = parsed_baseUrl.protocol;
    var host = parsed_baseUrl.host;

    // construct proxy request options
    var headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = host;
    var options = {
      host: parsed_baseUrl.hostname,
      port: parsed_baseUrl.port,
      path: url.replace(protocol + '//' + host, ''), // TODO url.parse-foo
      method: req.method,
      headers: headers
    };

    var preq = https.request(options, function(pres) {
      res.writeHead(pres.statusCode, pres.headers);
      pres.setEncoding('binary');
      pump(pres, res);
    });

    // XXX without this o.write(chunk) is borked
    req.setEncoding('binary');
    pump(req, preq);
  };
}).listen(1337, function () {
  console.log('Server running at http://127.0.0.1:1337/');
});
