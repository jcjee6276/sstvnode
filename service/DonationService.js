const DonationDAO = require('../DAO/DonationDAO');
const donationDAO = new DonationDAO();
const {v4} = require('uuid');

class DonationService {
  
  addDonation(userId, streamingUserId, donationAmout, donationContent) {
    //이거 만들어서 mysql이랑 연결하고 저장하기

    const donation = {
      
    }

  }
}

module.exports = DonationService;