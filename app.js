const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { connectToMongoDB } = require("./connection");
const ejsLayouts = require("express-ejs-layouts");

connectToMongoDB("mongodb://127.0.0.1:27017/locals-lib").then(() =>
  console.log("connected to local DB")
);
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const catalogRouter = require("./routes/catalog");

const app = express();

// view engine setup
app.set("views", [
  path.join(__dirname, "views"), // Default directory
  path.join(__dirname, "views/Forms"),
  path.join(__dirname, "views/List"),
  path.join(__dirname, "views/DetailByID"),
  path.join(__dirname, "views/DeletePage"), // Custom directory for forms
]);
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static("public"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
