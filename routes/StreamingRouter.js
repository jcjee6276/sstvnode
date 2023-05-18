var express = require('express');
var router = express.Router();
const StreamingService = require('../service/StreamingService');
const streamingService = new StreamingService();
var Data = require('../model/Data');
const Redis = require('../model/Redis');


router.get('/addStreaming', async (req, res, next) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const isRecord = req.body.isRecord;
    const resultCode =  await streamingService.addStreaming('test', sessionId, isRecord);
    
    
    switch (resultCode) {
      case 0:
        const stremingZero = await Redis.client.get(sessionId + '_streaming');
        response = new Data('success', stremingZero);
        break;

      case 1:
        response = new Data('fail', 'login require');
        break;

      case 2:
        const stremingTwo = await Redis.client.get(sessionId + '_streaming');
        response = new Data('already streaming', stremingTwo);
        break;
    }

    res.json(JSON.stringify(response));
  } catch (error) {
    console.log('[StremaingRouter /addStreaming] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/getServiceUrl', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID
    const serviceUrl = await streamingService.getServiceUrl(sessionId);
    console.log('[StreamingRouter /getServiceUrl] serviceUrl = ', serviceUrl);

    Redis.client.set(sessionId + '_serviceUrl', serviceUrl);

    response = new Data('success', '');
    res.json(JSON.stringify(response));
  } catch (error) {
    console.log('[StreamingRouter /getServiceUrl] error = ', error);
    
    response = new Data('fail', '');
    res.json(JSON.stringify(response));
  }
});

router.get('/getStreaming', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;

    const data =  await streamingService.getStremaing(sessionId);
    console.log('[Streaming Router /getStreaming] data = ', data);
  } catch (error) {
    console.log('[Streaming Router /getStreaming] error = ', error);
  }
});

module.exports = router;
