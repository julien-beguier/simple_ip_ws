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
  logger.info('[' + ip + '] : ' + msg);
}

function logError(ip, msg) {
  logger.error('[' + ip + '] : ' + msg);
}

// Create web server
var server = http.createServer(function (req, res) {
    // Getting ip from request
    var ipString = req.connection.remoteAddress;
    if (ipaddr.IPv6.isValid(ipString)) {
      var ip = ipaddr.IPv6.parse(ipString);
      if (ip.isIPv4MappedAddress()) {
        ipString = ip.toIPv4Address().toString();
      }
    }

  if (req.method == 'GET') {
    if (req.url == '/') { // check the URL of the current request

      logInfo(ipString, 'Received request ' + req.method);

      // Set response header
      res.writeHead(200, { 'Content-Type': 'application/json' });

      // Set response content
      res.write(JSON.stringify({ ip: ipString }));
      res.end();
    } else {
      logError(ipString, 'Invalid request received PATH=' + req.url);
      res.end();
    }
  } else {
    logError(ipString, 'Invalid request received METHOD=' + req.method);
    res.end();
  }
});

// Listen for any incoming requests
var server_port = 7380;

server.listen(server_port);
console.log('Simple IP WS launched on ' + server_port);
