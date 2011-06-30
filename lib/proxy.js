var http = require('http');
var https = require('https');
var parse_url = require('url').parse;
var pump = require('./node.util.pump').pump;

var protocol_defaults = {
  'https:': {
    module: https,
    port: 443,
  },
  'http:': {
    module: http,
    port: 80,
  }
};

exports.handle_request = function (proxy_table, req, res) {
  var match = /^\/([^\/]+)(.*)$/.exec(req.url);
  var proxyAlias = match[1];
  if (proxyAlias in proxy_table) {
    var baseUrl = proxy_table[proxyAlias];
    var url = baseUrl + match[2];

    var parsed_baseUrl = parse_url(baseUrl);

    var protocol = parsed_baseUrl.protocol;
    var hostname = parsed_baseUrl.hostname;
    var host = parsed_baseUrl.host;
    var port = parsed_baseUrl.port || protocol_defaults[protocol].port;
    var path = url.replace(protocol + '//' + host, ''); // TODO url.parse-foo
    var method = req.method;
    var module = protocol_defaults[protocol].module;
    var headers = JSON.parse(JSON.stringify(req.headers));
    headers.host = host;

    // construct proxy request options
    var options = {
      host: hostname,
      port: port,
      path: path,
      method: method,
      headers: headers
    };

    var preq = module.request(options, function(pres) {
      res.writeHead(pres.statusCode, pres.headers);
      pump(pres, res);
      console.log(
        'proxy request:', method, req.url, '[' + url + ']',
        '=>', pres.statusCode);
    });

    // XXX w/o this pump's writeStream.write(chunk) is borked
    req.setEncoding('binary');

    pump(req, preq);

    return true;
  };
};
