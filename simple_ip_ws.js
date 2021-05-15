var http = require('http'); // Import Node.js core module
var ipaddr = require('ipaddr.js'); // Import ipaddr.js

// Create web server
var server = http.createServer(function (req, res) {
    if (req.url == '/') { // check the URL of the current request

        // Set response header
        res.writeHead(200, { 'Content-Type': 'application/json' });

        var ipString = req.connection.remoteAddress;
        if (ipaddr.IPv6.isValid(ipString)) {
          var ip = ipaddr.IPv6.parse(ipString);
          if (ip.isIPv4MappedAddress()) {
            ipString = ip.toIPv4Address().toString();
          }
        }

        // Set response content
        res.write(JSON.stringify({ ip: ipString}));
        res.end();
    } else {
        res.end('Invalid Request!');
    }
});

//const parseIp = (req) => req.headers['x-forwarded-for'].split(',').shift() || req.socket.remoteAddress;
//const parseIp = (req) => req.socket.remoteAddress;

// Listen for any incoming requests
var server_port = 7380;

server.listen(server_port);
console.log('Simple IP WS launched on ' + server_port);
