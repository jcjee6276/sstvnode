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

router.post('/testLogin', async (req, res, next) => {
  try {
    const user = req.body;

    if(user){
      const sessionId = req.cookies.NSESSIONID;
      if(sessionId == null || sessionId == undefined) {
        const sessionId = v4();

        await Redis.client.set(sessionId + '_user', JSON.stringify(user));
        res.cookie('NSESSIONID', sessionId, 
        { 
          httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 
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
