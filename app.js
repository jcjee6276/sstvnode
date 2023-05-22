const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");

//router 등록
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/StreamingRouter');


//api 요청에 사용할 key
global.accessKey = 'z4Xcnb9Fi7MmuSeksVf4';
global.secretKey = 'nt9eOEVgBxjdmjqOgP9Xee44ADNmEDT171bekE2u';
global.clientId = 'ie3vug56gz';
global.clientSecret = 'HAqoUe2ZG2GxgZDVweFjB4DicnttKodNFP2yfp6y';

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/streaming', usersRouter);


// 에러 핸들러
app.use(function(err, req, res, next) {
  console.log('[app.js] catch error');
  console.error(err);
  res.status(500).json({ error: 'Server Internal Error' });
});

module.exports = app;
