var express = require('express');
var router = express.Router();
var {v4} = require('uuid');
var Redis = require('../model/Redis');
var Data = require('../model/Data');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.cookies.NSESSIONID);
  res.json("[Start Node Server]")
});

/* 
나중에 Spring의 User 만들어지면 model에 user 만들어서 user 담기 + 로그아웃도 구현
*/
// router.post('/addCookie', (req, res, next) => {
//   // const {userId, password} = req.body.data;
//   console.log('req.body.data = ', req.body.data);
  
  

//   const sessionId = v4();
  
//   // try {
//   //   Redis.client.set(sessionId, userId);  
//   // } catch (error) {
//   //   console.log('[index.js /addCookie] error = ', error);
//   //   return error;
//   // }
  
//   res.json(sessionId);
// });

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
router.post('/addCookie', async (req, res) => {
  const user = req.body.data;
  
  try {
    const sessionId = req.cookies.NSESSIONID;
    if(sessionId == null || sessionId == undefined) {
      const sessionId = v4();

      //임시 유저
      console.log('sessionId = ', sessionId);
      await Redis.client.set(sessionId + '_user', JSON.stringify(user));
      res.json(sessionId);
      return;
    }

    res.json(sessionId);
  } catch(error) {
    console.log('[index.js /login] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }    
});

module.exports = router;
