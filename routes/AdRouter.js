const express = require('express');
const router = express.Router();
const path = require("path");
const {v4} = require('uuid');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const adService = new (require('../service/AdService'))();
const adRestDAO = new (require('../DAO/AdRestDAO'))();
const Data = require('../model/Data');


router.post('/addAdReq', upload.single('file'), (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;
    const ext = path.extname(req.file.originalname);

    const uuid = v4();
    const file = req.file;
    const fileName = uuid + ext;
    
    adService.addAdReq(sessionId, file, fileName);

    const response = new Data('success', '');
    res.json(response);
  } catch (error) {
    console.log('[AdRouter /addAdReq] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/updateProcessCode', async (req, res) => {
  try {
    const processCode = req.query.processCode;
    const adReqNo = req.query.adReqNo;
    const denyCode = req.query.denyCode;

    const result = await adService.updateProcessCode(adReqNo, processCode, denyCode);

    let response;
    if(result == 'success') {
      response = new Data('success', '');
    }else {
      response = new Data('fail', '');
    }

    return res.json(response);
  } catch (error) {
    console.log('[AdRouter /updateAdProcessCode] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/getAdReqList', async (req, res) => {
  try {
    const list = await adService.getAdReqList();
    res.json(list);
  } catch (error) {
    console.log('[AdRouter /getAdReqList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/playAd', (req, res) => {
  try {
    adService.playAd();
    res.json('test');
  } catch (error) {
    console.log('[AdRouter /getAdReqList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});

router.get('/removeAllLiveCurtain',async (req, res) => {
  try {
    await adService.removeAllLiveCurtain();
    res.json('삭제완료');
  } catch (error) {
    console.log('[AdRouter /getAdReqList] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
});
  
module.exports = router;