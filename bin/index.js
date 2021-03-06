require("dotenv").config();

/**
 * Module dependencies.
 */

var app = require("../app");
var http = require("http");
var fs = require("fs");
var https = require("https");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "4000");

if (process.env.USE_HTTPS == 1) {
  port = "443";
}

app.set("port", port);

/**
 * Create HTTP or HTTPS server.
 */

var server;
if (process.env.USE_HTTPS == 1) {
  const options = {
    key: fs.readFileSync(process.env.KEY_FILE_PATH),
    cert: fs.readFileSync(process.env.CERT_FILE_PATH),
  };
  console.log("Using HTTPS");
  server = https.createServer(options, app);
} else {
  server = http.createServer(app);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use!!!");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;

  console.log("Listening on " + bind);
}
