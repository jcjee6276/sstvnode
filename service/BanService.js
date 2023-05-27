const banDAO = new (require('../DAO/BanDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();


class BanService{
  async addStreamingRollBan(ban) {
    const banResult = await banDAO.addStreamingRollBan(ban);
    const userResult = await userDAO.updateStRoll(ban.userId, 1);

    let result;
    if((banResult == 'success') && (userResult == 'success')) {
      result = 'success';
    } else {
      result = 'fail';
    }

    return result;
  }

  async removeStreamingRollBan(userId) {
    const result = await userDAO.updateStRoll(userId, 0);

    let response;
    if(result == 'success') {
      response = 'success';
    } else {
      response = 'fail';
    }

    return response;
  }

  async getStreamingRollBan(streamingRollBanNo) {
    const result = await banDAO.getStreamingRollBan(streamingRollBanNo);

    return result;
  }

  async getStreamingRollBanList() {
    const result = await banDAO.getStreamingRollBanList();

    return result;
  }
}

module.exports = BanService;