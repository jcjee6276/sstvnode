const donationRestDAO = new (require('../DAO/DonationRestDAO'))();
const donationDAO = new (require('../DAO/DonationDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const Redis = require('../model/Redis');

class DonationService {
  
  async addDonation(sessionId ,donation) {
    try {
      console.log('[DonationService addDonation] donation = ', donation);
      const user = await Redis.client.get(sessionId + '_user');
    
      if(user) {
        const userId =  JSON.parse(user).userId;
        const donationAmount = donation.DONATION_AMOUNT
  
        if(this.validateUserCoin(userId, donationAmount)) {
          const coin = await userDAO.getUserCoin(userId);
          console.log('[DonationService addDonation] coin = ', coin);
          const updateCoin = (coin - donationAmount);
          
          
          userDAO.updateUserCoin(updateCoin, userId);
          userDAO.addUserCoinHistory(userId, donationAmount, 0);
          // donationRestDAO.textToMp3(donation.DONATION_CONTENT);
        }
      }
    } catch (error) {
      console.log('[DonationService addDonation] error = ', error);
    }
  }

  async validateUserCoin(userId, donationAmount) {
    const coin = await userDAO.getUserCoin(userId);

    if(coin > donationAmount) {
      return true;
    } else {
      return false;
    }
  }

  async isLogin(sessionId) {
    sessionId = sessionId + "_user";
    if(sessionId == null || sessionId == undefined) {
      return false;
    }

    const user =  await Redis.client.get(sessionId);
    
    if(user == null || user == undefined) {
      return false;
    }
    return true;
  }
}
module.exports = DonationService;