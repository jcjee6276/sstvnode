var express = require('express');
var router = express.Router();
var {v4} = require('uuid');
var Redis = require('../model/Redis');
var Data = require('../model/Data');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json("[Start Node Server]")
});

/* 
나중에 Spring의 User 만들어지면 model에 user 만들어서 user 담기 + 로그아웃도 구현
*/
router.post('/addCookie', (req, res, next) => {
  const {userId, password} = req.body.data;
  
  console.log('userId', userId);
  console.log('password', password);

  const sessionId = v4();
  
  try {
    Redis.client.set(sessionId, userId);  
  } catch (error) {
    console.log('[index.js /addCookie] error = ', error);
    return error;
  }
  
  res.json(sessionId);
});

router.post('/removeCookie', (req, res, next) => {
  console.log('[index.js /removeCookie] req.body.data = ', req.body.data);

  const sessionId = req.body.data;
  
  try {
    Redis.client.del(sessionId);
  } catch (error) {
    console.log('[index.js /removeCookie] error = ', error);
    return error;
  }

  res.json('removeSuccess');
});

//테스트를 위해 임시로 로그인 시키기
router.get('/login', (req, res) => {
  
  try {
    const sessionId = req.cookies['NSESSIONID'];
    let data;

    if(sessionId == null || sessionId == undefined) {
      const sessionId = v4();

      res.cookie('NSESSIONID', sessionId, {
        path : '/',
        httpOnly : true
      });

      Redis.client.set(sessionId + '_user', 'testUser');
      res.json(JSON.stringify(data));
    }

    Redis.client.set(sessionId, '');
    res.json(JSON.stringify(data));
  } catch(error) {
    console.log('[index.js /login] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }    
});

module.exports = router;
