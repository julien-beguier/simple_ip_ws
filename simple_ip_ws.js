var http = require('http'); // Import Node.js core module
const ipaddr = require('ipaddr.js'); // Import ipaddr.js
const winston = require('winston'); // Import Winston logger

const logger = new winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-ip.log' }) // combined log file (info + error)
  ]
});

function logInfo(ip, msg) {
  logger.info('[' + ip + '] ' + msg);
}

function logWarn(ip, msg) {
  logger.warn('[' + ip + '] ' + msg);
}

function logError(ip, msg) {
  logger.error('[' + ip + '] ' + msg);
}

// Create web server
var server = http.createServer(function (request, response) {

  // If service is accessed from a browser, it will receive a request to get the favicon.ico but we don't want it logged
  if (request.url == '/favicon.ico') {
    response.writeHead(404);
    response.end();
    return;
  }

  // Getting ip from request
  var ip_string = request.connection.remoteAddress;
  if (ipaddr.IPv6.isValid(ip_string)) {
    var ip_tmp = ipaddr.IPv6.parse(ip_string);
    if (ip_tmp.isIPv4MappedAddress()) {
      ip_string = ip_tmp.toIPv4Address().toString();
    }
  }

  if (request.method == 'GET') {
    if (request.url == '/') { // check the URL of the current request

      logInfo(ip_string, 'Received request ' + request.method);

      // Set response header
      response.writeHead(200, { 'Content-Type': 'application/json' });

      // Set response content
      response.write(JSON.stringify({ ip: ip_string }));
      response.end();
    } else {
      logWarn(ip_string, 'Ignoring invalid request PATH=' + request.url);
      response.end();
    }
  } else {
    logWarn(ip_string, 'Ignoring invalid request METHOD=' + request.method);
    response.end();
  }
});

// Listen for any incoming requests
var server_port = 7380;

server.listen(server_port);
logInfo('system', 'Simple IP WS launched on ' + server_port);
