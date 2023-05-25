const donationDAO = new (require('./DAO/DonationDAO'))();
const moment = require('moment');


// test();

// async function test(userId) {
//   const result = await donationDAO.getUserCoin('user1')
//   console.log('result = ', result);
// }

const donation = {
  USER_ID : 'user1',
  STREAMING_USER_ID : 'user20',
  STREAMING_NO : 30,
  DONATION_AMOUNT : 10000,
  DONATION_CONTENT : '저장테스트입니다.',
  DONATION_DATE : moment().format('YYYY-MM-DD/HH:mm')
}

donationDAO.addDonation(donation);




