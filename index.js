var http = require('http');
var proxy = require('./proxy').handle_request;

var filename = __dirname + '/proxy-table.json';
var table = JSON.parse(require('fs').readFileSync(filename));

http.createServer(function (req, res) {
  if (!proxy(table, req, res)) {
    var reason = 'You are made of stupid!'
    var content = '[35;1m' + reason + '[m\r\n';
    var headers = {
      'content-type': 'text/plain',
      'content-length': content.length
    };
    res.writeHead(404, reason, headers);
    res.end(content);
  };
}).listen(1337, function () {
  console.log('Server running at http://127.0.0.1:1337/');
});
