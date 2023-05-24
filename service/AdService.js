const adRestDAO = new (require('../DAO/AdRestDAO'))();
const streamingService = new (require('../service/StreamingService'))();
const adDAO = new (require('../DAO/AdDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const {v4} = require('uuid');
const Redis = require('../model/Redis');

//추후 mysql이랑 연결하고 데이터 저장까지
class AdService {

  /* 
  1. 로그인이되어있어야한다
  2. 코인을 10000이상 보유해야한다.
  */
  async addAdReq(sessionId, file, fileName) {
    if(this.isLogin(sessionId) && this.validateCoin(sessionId)) {
      const user = await Redis.client.get(sessionId + '_user');
      
      if(user) {
        const userId = (JSON.parse(user)).userId;
        const userCoin = await userDAO.getUserCoin(userId);
        
        userDAO.updateUserCoin(userCoin - 10000);
        userDAO.addUserCoinHistory(userId, -10000, 3);

        adRestDAO.uploadFileToObjectStorage(file, fileName);
        adDAO.addAdReq(userId, fileName, 10000);
      }
    }
  }

  /* 
  0 : 광고신청완료
  1 : 광고등록완료
  2 : 광고거절완료
  */
  async updateProcessCode(adReqNo, processCode, denyCode) {
    adDAO.updateProcessCode(adReqNo, processCode, denyCode);

    if(denyCode) {
      const fileName = await adDAO.getAdName(adReqNo);
      console.log('[AdService updateProcessCode] fileName = ', fileName);
      adRestDAO.removeFileFromObjectStorage(fileName);
    }
  }

  //2주차에 searchCondition, searchKeyword 추가
  async getAdReqList() {
    const list = await adDAO.getAdReqList();
    return list;
  }

  async playAd() {
    try {
      const adList = await adDAO.getAdList();
      const fileName = await adList[0].AD_NAME;
      const curtainId =  await adRestDAO.createLiveCurtain(fileName);
      
      let status;
      while(status != 'READY') {
        status = await new Promise((resolve) => {
          setTimeout(async () => {
            const status = await adRestDAO.getCurtainStatus(curtainId);
            resolve(status);    
          }, 5000);
        });
      }
      
      const keys = await Redis.client.keys('*_onStreaming');
      let adPlaysCount = adList[0].AD_PLAYS_COUNT;
      let adStreamingPlaysCount = adList[0].AD_STREAMING_PLAYS_COUNT;
      let adTotalViewers = adList[0].AD_TOTAL_VIEWERS;
      
      for(const key of keys) {
        const stremaing = JSON.parse(await Redis.client.get(key));
        const channelId = stremaing.channelIdWithAd;
        const streamingViewer = stremaing.streamingViewer;
    
        adStreamingPlaysCount++;
        adTotalViewers += streamingViewer;
        
        await adRestDAO.startLiveCurtain(channelId, curtainId);
        console.log('[AdService startLiveCurtain()]');
      }
      
      adPlaysCount++;
      await adDAO.updateAdPlaysCount(adList[0].AD_REQ_NO, adPlaysCount);
      await adDAO.updateAdStreamingPlaysCount(adList[0].AD_REQ_NO, adStreamingPlaysCount);
      await adDAO.updateAdTotalViewer(adList[0].AD_REQ_NO, adTotalViewers);

    } catch (error) {
      console.log('[AdService playAd] error = ', error);
    }
  }
  
  //donation영역
  async addDonation(sessionId, streamingUserId, donationAmout, donationContent) {
    const channelWithId = JSON.parse(await Redis.client.get(streamingUserId + '_onStreaming')).channelIdWithAd;
    const channelWithOutId = JSON.parse(await Redis.client.get(streamingUserId + '_onStreaming')).channelIdWithOutAd;

    const uuid = v4();
    const imgFileName = await adRestDAO.textToImg(donationContent, uuid);
    // const mp3FileName = await adRestDAO.textToMp3(donationContent, uuid);

    // console.log('imgFileName = ', imgFileName);
    // console.log('mp3FileName = ', mp3FileName);

    await adRestDAO.uploadFileToObjectStorage(imgFileName);
    // await adRestDAO.uploadFileToObjectStorage(mp3FileName);

    // const curtainId = await adRestDAO.createLiveCurtain(imgFileName, 'null');
    const curtainId = 93;
    // console.log('[AdService addDonation] curtainId = ', curtainId);


    this.startLiveCurtain(channelWithId, curtainId);
    this.startLiveCurtain(channelWithOutId, curtainId);
  }

  async getLiveCurtainList() {
    return await adRestDAO.getLiveCurtainList();
  }

  async startLiveCurtain(channelId ,curtainId) {
    adRestDAO.startLiveCurtain(channelId ,curtainId);
  }

  async removeLiveCurtain(curtainId) {
    await adRestDAO.removeLiveCurtain(curtainId);
  }

  async removeAllLiveCurtain() {
    const result = await new Promise(async (resolve, reject) => {
      try {
        const curtainList = (await this.getLiveCurtainList()).content;
    
        for (const curtain of curtainList) {
          await this.removeLiveCurtain(curtain.id);
        }

        resolve();
      } catch (error) {
        console.log('[AdService removeAllLiveCurtain] error = ', error);
        reject(error);
      }  
    });
  }

  //로그인되어있으면 true, 안되어있으면 false
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

  //user의 코인이 10000원보다 많으면 true
  async validateCoin(sessionId) {
    const user =  await Redis.client.get(sessionId + '_user');

    let userId;
    if(user) {
      const userId = (JSON.parse(user)).userId;
      const userCoin = await userDAO.getUserCoin(userId);

      console.log('[userCoint] = ', userCoin);
      if(userCoin >= 10000) {
        return true;
      }
    }

    return false;
  }
}

module.exports = AdService;