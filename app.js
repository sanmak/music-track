const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const v1 = require('./routes/version-1.js');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/v1', v1);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({'error' : err.status || 500});
});

module.exports = app;
