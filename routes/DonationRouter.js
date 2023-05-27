const express = require('express');
const router = express.Router();
const donationService = new (require('../service/DonationService'))();
const Data = require('../model/Data');
const moment = require('moment');

router.post('/addDonation', async (req, res) => {
  try {
    const sessionId = req.cookies.NSESSIONID;

    const donation = {
      USER_ID : req.body.userId,
      STREAMING_USER_ID : req.body.streamingUserId,
      STREAMING_NO : req.body.streamingNo,
      DONATION_AMOUNT : req.body.donationAmount,
      DONATION_CONTENT : req.body.donationContent,
      DONATION_DATE : moment().format('YYYY-MM-DD/HH:mm')
    }
    const voiceType = req.body.voiceType
    const result = await donationService.addDonation(sessionId, donation, voiceType);  

    let response;
    if(result == 'success') {
      response = new Data('success', '');
    } else {
      response = new Data('fail','');
    }
    res.json(response);
  } catch (error) {
    console.log('[DonationRouter /addDonation] error = ', error);
    res.status(500).json({ error: 'Server Internal Error' });
  }
  
});

module.exports = router;