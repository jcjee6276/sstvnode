const exprss = require('express');
const router = exprss.Router();
const banService = new (require('../service/BanService'))();
const Data = require('../model/Data');

/* 
  1. BAN 테이블에 데이터 넣고 user의 st_ROLL도 업데이트하자
*/
router.post('/addStreamingRoleBan', async (req, res) => {
  const ban = req.body;
  const result = await banService.addBan(ban);
  
  let response;
  if(result == 'success') {
    response = new Data('success', '');
  }else {
    response = new Data('fail', '');
  }

  res.json(response);
});

router.get('/removeStreamingRollBan', async (req, res) => {
  const userId = req.query.userId;
  console.log('[BanRouter /removeStreamingRollBan] userId = ', userId);

  const result = await banService.removeStreamingRollBan(userId);

  let response;
  if(result == 'success') {
    response = new Data('success', '');
  }else {
    response = new Data('fail', '');
  }

  res.json(response);
});

router.get('/getStreamingRollBan', async (req, res) => {
  const streamingRollBanNo = req.query.streamingRollBanNo;

  const result = await banService.getStreamingRollBan(streamingRollBanNo);

  let response;
  if(result == 'fail') {
    response = new Data('fail', '');
  }else {
    response = new Data('success', result);
  }

  res.json(response);
});

router.get('/getStreamingRollBanList', async (req, res) => {
  try {
    const searchCondition = req.query.searchCondition;
    const searchKeyword = req.query.searchKeyword;
    console.log('[BanRouter /getStreamingRollBanList] searchCondition = ', searchCondition);
    console.log('[BanRouter /getStreamingRollBanList] searchKeyword = ', searchKeyword);

    const result = await banService.getStreamingRollBanList(searchCondition, searchKeyword);

    let response;
    if(result == 'fail') {
      response = new Data('fail', '');
    }else {
      response = new Data('success', result);
    }

    res.json(response); 
  } catch (error) {
    console.log('[BanRouter /getStreamingRollBanList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

/* 
입력 body
1. userId
2. banType
3. banContent
*/
router.post('/addStreamingBan', async (req, res) => {
  const ban = req.body;  
  console.log('[BanRouter /addStreamingBan] ban = ', ban);
  // const result = await banService.addStreamingBan(ban);

  let response;
  if(result == 'fail') {
    response = new Data('fail', '');
  }else {
    response = new Data('success', '');
  }
  
  res.json(response);
});

router.get('/getStreamingBan', async (req, res) => {
  const streamingNo = req.query.streamingNo;
  const result = await banService.getStreamingBan(streamingNo);

  let response;
  if(result == 'fail') {
    response = new Data('fail', '');
  }else {
    response = new Data('success', result);
  }

  res.json(response);
});

router.get('/getStreamingBanList', async (req, res) => {
  try {
    const searchCondition = req.query.searchCondition;
    const searchKeyword = req.query.searchKeyword;

    const result = await banService.getStreamingBanList(searchCondition, searchKeyword);

    let response;
    if(result == 'fail') {
      response = new Data('fail', '');
    }else {
      response = new Data('success', result);
    }

    res.json(response);
  } catch (error) {
    console.log('[BanRouter /getStreamingBanList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});
module.exports = router;