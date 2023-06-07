var express = require('express');
var router = express.Router();
var {v4} = require('uuid');
var Redis = require('../model/Redis');
var Data = require('../model/Data');

/* GET home page. */



router.post('/testLogin', async (req, res, next) => {
  try {
    const user = req.body;

    if(user){
      
      const sessionId = req.cookies.NSESSIONID;
      
      console.log("se"+sessionId);
      if(sessionId == null || sessionId == undefined) {
        const sessionId = v4();

        await Redis.client.set(sessionId + '_user', JSON.stringify(user));
        res.cookie('NSESSIONID', sessionId, 
        { 
          httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 
        });
        res.json(new Data('success', 'test'));
        return;
      }
    }
  } catch(error) {
    console.log('[index.js /login] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }  
});

router.get('/testLogout', (req, res) => {
  const sessionId = req.cookies.NSESSIONID;
  console.log('[index.js /testLogout] sessionId = ', sessionId);
  Redis.client.del(sessionId + '_user');
  res.json(new Data('success', ''));
});

//테스트를 위해 임시로 로그인 시키기
router.post('/addCookie', async (req, res) => {
  const user = req.body.data;
  
  try {
    const sessionId = req.cookies.NSESSIONID;
    if(sessionId == null || sessionId == undefined) {
      const sessionId = v4();

      //임시 유저
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
