const donationRestDAO = new (require('../DAO/DonationRestDAO'))();
const donationDAO = new (require('../DAO/DonationDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const Redis = require('../model/Redis');

class DonationService {
  
  async addDonation(sessionId ,donation, voiceType) {
    try {
      const user = await Redis.client.get(sessionId + '_user');
    
      if(user) {
        const userId =  JSON.parse(user).userId;
        const donationAmount = donation.DONATION_AMOUNT
  
        if(this.validateUserCoin(userId, donationAmount)) {
          const coin = await userDAO.getUserCoin(userId);
          const updateCoin = (coin - donationAmount);
          
          userDAO.updateUserCoin(updateCoin, userId);
          userDAO.addUserCoinHistory(userId, donationAmount, 0);
          donationDAO.addDonation(donation);

          const content = `${userId}님이 ${donationAmount}원을 후원하였습니다.  ` + donation.DONATION_CONTENT;
          donationRestDAO.textToMp3(content, voiceType);

          return 'success';
        }
      }
    } catch (error) {
      console.log('[DonationService addDonation] error = ', error);
      return 'fail';
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