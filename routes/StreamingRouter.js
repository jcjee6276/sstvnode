var express = require('express');
var router = express.Router();
const StreamingService = require('../service/StreamingService');
const streamingService = new StreamingService();
var Data = require('../model/Data');


/* 

  {result : success, data : 0} : 스트리밍 시작 가능
  {result : fail, data : 1} : 로그인 필요
  {result : fail, data : 2} : 이미 스트리밍중
  {result : fail, data : 3} : 스트리밍 권한 정지
*/
router.get('/addStreaming', async (req, res, next) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const resultCode =  await streamingService.validateAddStreaming(sessionId);
    console.log('[StreamingRouter /addStreaming] resultCode = ', resultCode);
    
    switch (resultCode) {
      case 0:
        response = new Data('success', 0);
        break;

      case 1:
        response = new Data('fail', 1);
        break;

      case 2:
        response = new Data('fail', 2);
        break;

      case 3:
        response = new Data('fail', 3);
        break;
    }

    res.json(JSON.stringify(response));
  } catch (error) {
    console.log('[StremaingRouter /addStreaming] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.post('/addStreaming', async (req, res) => {
  try {
    const streamingTitle = req.body.streamingTitle;
    const isRecord = req.body.isRecord;
    const category = req.body.category;
    const sessionId = req.cookies.NSESSIONID;
    
    const result = await streamingService.addStreaming(streamingTitle, isRecord, category, sessionId);

    if(result == 'success') {
      response = new Data('success', '');
    } else {
      response = new Data('fail', '');
    }
    
    res.json(JSON.stringify(response));
  } catch (error) {
    console.log('[StreamingRouter /addStreaming] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/getServiceUrl', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID
    const serviceUrl = await streamingService.getServiceUrlAndThumbnail(sessionId);

    if(serviceUrl == 'fail') {
      response = new Data('fail', '');
      res.json(JSON.stringify(response));
      return;
    }
    
    response = new Data('success', '');
    res.json(JSON.stringify(response));

  } catch (error) {
    console.log('[StreamingRouter /getServiceUrl] error = ', error);

    response = new Data('fail', '');
    res.json(JSON.stringify(response));
  }
});

router.get('/getMyStreamingPage', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const _onStreaming =  await streamingService.getStremaing(sessionId);

    resposne = new Data('success', _onStreaming);
    res.json(resposne);
  } catch (error) {
    console.log('[Streaming Router /getStreaming] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});


router.get('/getStreamingViewerPage', async (req, res) => {
  try {
    const userId = req.query.userId;
    const result = await streamingService.getStreamingByUserId(userId);

    let response;
    if(result == 'fail') {
      response = new Data('fail', '');
      res.json(response);
      return;
    }

    response = new Data('success', result);
    res.json(response);
  } catch (error) {
    console.log('[Streaming Router /getStreamingViewerPage] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/getStreamingList', async (req, res) => {
  try {
    const streamingList = await streamingService.getStreamingList();
    
    res.json(streamingList);
  } catch (error) {
    console.error('[StreamingRouter /getStreamingList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/updateStreamingTitle', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const streamingTitle =  req.query.streamingTitle;
    const result = await streamingService.updateStreamingTitle(sessionId, streamingTitle);

    let response;
    if(result == 'success') {
      response = new Data('success', '');
    } else {
      response = new Data('fail','');
    }
    
    res.json(response);
  } catch (error) {
    console.log('[StreamingRouter /updateStreamingtitle] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/updateStreamingCategory', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const streamingCategory =  req.query.streamingCategory;
    const result = await streamingService.updateStreamingCategory(sessionId, streamingCategory);

    let response;
    if(result == 'success') {
      response = new Data('success', '');
    } else {
      response = new Data('fail','');
    }
    
    res.json(response);
  } catch (error) {
    console.log('[StreamingRouter /updateStreamingCategory] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/finishStreaming', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const result =  await streamingService.finishStreaming(sessionId);

    let response;
    if(result != 'fail') {
      response = new Data('success', result);
      streamingService.delStreaming(sessionId);
      
      res.json(response);
      return;
    }

    response = new Data('fail', '');
    res.json(response);
    return;
  } catch (error) {
    console.log('[StreamingRouter /removeStreaming] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

//test
router.get('/sendStreamingToSpring', async (req ,res) => {
  const sessionId = req.cookies.NSESSIONID;
  const result = await streamingService.sendStreamingToSpring(sessionId);
  console.log('[StreamingRouter /sendStreamingToSpring] result = ', result);
  res.json('success');
});



module.exports = router;
