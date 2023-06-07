const banDAO = new (require('../DAO/BanDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const streamingRestDAO = new (require('../DAO/StreamingRestDAO'))();
const streamingDAO = new (require('../DAO/StreamingDAO'))();
const Redis = require('../model/Redis');



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

  async addStreamingBan(ban) {
    try {
      let result;
      let stopStreamingResultWithAd;
      let stopStreamingResultWithOutAd;
      let removeStreamingResultWithAd;
      let removeStreamingResultWithOutAd;

      let streaming = await Redis.client.get(ban.userId + '_onStreaming');
      if(streaming) {
        streaming = JSON.parse(streaming);

        streaming.banType = ban.banType;
        streaming.banContent = ban.banContent;
        result = await banDAO.addStreamingBan(streaming);

        const channelIdWithAd = streaming.channelIdWithAd;
        const channelIdWithOutAd = streaming.channelIdWithOutAd;
    
        stopStreamingResultWithAd = await streamingRestDAO.stopStreaming(channelIdWithAd);
        stopStreamingResultWithOutAd = await streamingRestDAO.stopStreaming(channelIdWithOutAd);

        removeStreamingResultWithAd = await streamingRestDAO.removeStreaming(channelIdWithAd);
        removeStreamingResultWithOutAd = await streamingRestDAO.removeStreaming(channelIdWithOutAd);
      }

      let response;
      if(result == 'success') {
        response = 'success';
      }else {
        response = 'fail';
      }
      return result;
    } catch (error) {
      console.log('[BanService addStreamingBan] error = ', error);
      return 'fail';
    }
  }

  async getStreamingBan(streamingNo) {
    try {
      const streaming = await streamingDAO.getStreaming(streamingNo);
      return streaming;
    } catch (error) {
      console.log('[BanService getStreamingBan] error = ', error);
      return 'fail';
    }
  }

  async getStreamingBanList(userId) {
    try {
      const streamingBanList = await banDAO.getStreamingBanList(userId)
      return streamingBanList;
    } catch (error) {
      console.log('[BanService getStreamingBanList] error = ', error);
      return 'fail';
    }
  }
}

module.exports = BanService;