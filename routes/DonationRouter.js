const express = require('express');
const router = express.Router();
const donationService = new (require('../service/DonationService'))();
const moment = require('moment');

router.post('/addDonation', (req, res) => {
  const sessionId = req.cookies.NSESSIONID;

  const donation = {
    USER_ID : req.body.userId,
    STREAMING_USER_ID : req.body.streamingUserId,
    STREAMING_NO : req.body.streamingNo,
    DONATION_AMOUNT : req.body.donationAmount,
    DONATION_CONTENT : req.body.donationContent,
    DONATION_DATE : moment().format('YYYY-MM-DD/HH:mm')
  }
  
  console.log('[DonationRouter /addDonation] donation = ', donation);
  // donationService.addDonation(sessionId, donation);
});

module.exports = router;