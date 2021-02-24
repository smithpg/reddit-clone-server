/* Import node libraries */
const path = require("path");

/* Import 3rd party libraries */
const express = require("express");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

/* Import custom */
const bodyLogger = require("./utils/bodyLogger");
const apiRouter = require("./routes");

/* Configure express app */
const app = express();

app.use(cors());
app.options("*", cors()); // For "complex" CORS requests that require preflighting
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
  app.use(bodyLogger);
}

app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
