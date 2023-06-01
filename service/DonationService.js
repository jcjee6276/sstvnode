const donationRestDAO = new (require('../DAO/DonationRestDAO'))();
const donationDAO = new (require('../DAO/DonationDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const Redis = require('../model/Redis');
const sockHandler = require('../sokets/socketHandler');

class DonationService {
  
  async addDonation(donation, voiceType) {
    try {
      const userId =  donation.USER_ID;
      const streamerId = donation.STREAMING_USER_ID;
      const donationAmount = donation.DONATION_AMOUNT

      if(this.validateUserCoin(userId, donationAmount)) {
        const coin = await userDAO.getUserCoin(userId);
        const updateCoin = (coin - donationAmount);
        
        userDAO.updateUserCoin(updateCoin, userId);
        userDAO.addUserCoinHistory(userId, donationAmount, 0);
        donationDAO.addDonation(donation);

        const content = `${userId}님이 ${donationAmount}원을 후원하였습니다.  ` + donation.DONATION_CONTENT;
        const fileName = `${userId}_${streamerId}.mp3`;
        
        await donationRestDAO.textToMp3(content, voiceType, fileName);
        setTimeout(async() => {
          await donationRestDAO.uploadFileToObjectStorage(fileName);
        }, 2000);
        return 'success';
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

  async getUserBySessionId(sessionId) {
    try {
      const user = await Redis.client.get(sessionId + '_user');

      if(user) {
        const userId = (JSON.parse(user)).userId;
        return userId;
      }else {
        return 'fail';
      }
    } catch (error) {
      console.log('[DonationService getUserBySessionId] error = ', error);
      return 'fail';
    }

  }
}
module.exports = DonationService;