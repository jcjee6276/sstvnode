var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var redis = require('redis');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/StreamingRouter');

//api 요청에 사용할 key
global.accessKey = 'z4Xcnb9Fi7MmuSeksVf4';
global.secretKey = 'nt9eOEVgBxjdmjqOgP9Xee44ADNmEDT171bekE2u'

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/streaming', usersRouter);


// error handler
app.use(function(err, req, res, next) {
  console.log('[app.js] catch error');
  console.error(err);
  res.status(500).json({ error: 'Server Internal Error' });
});

module.exports = app;
