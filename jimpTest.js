const DonationService = require('./service/DonationService');
const DonationDAO = require('./DAO/DonationDAO');
const donationService = new DonationService();
const donationDAO = new DonationDAO();
const {v4} = require('uuid');
// donationService.textToImg('test imge');
//donationService.textToMp3();
const text = '야야야야야야야야야야야야야 얼른 말해봐라'
const uuid = v4();

donationDAO.textToMp3NAPI(text, uuid);

