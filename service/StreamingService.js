const e = require('cors');
const streamingRestDAO = new(require('../DAO/StreamingRestDAO'))();
const Redis = require('../model/Redis');
const streamingDAO = new (require('../DAO/StreamingDAO'))();
const userDAO = new (require('../DAO/UserDAO'))();
const moment = require('moment');


class StreamingService {
  /* 
  1. 회원인지 체크
  2. 회원이 아니면 1 반환
  3. 이미 스트리밍중이였는지 체크
  4. 이미 스트리밍중이였으면 2 반환
  5. 채널생성에 성공하면 0반환
  */
 async validateAddStreaming(sessionId) {
    const isLogin =  await this.isLogin(sessionId);
    const isStreaming =  await this.isStreaming(sessionId);
    const stRoll = await this.validateUserStRole(sessionId);

    if(isLogin && isStreaming && (stRoll == 0)) {
      return 0;
    } else {
      if(isLogin == false) {
        return 1;
      }

      if(isStreaming == false) {
        return 2;
      }

      if(stRoll == 1) {
        return 3;
      }
    }
  }

  async addStreaming(streamingTitle, isRecord, category , sessionId) {
    try {
      const channelIdWithAd = await streamingRestDAO.createChannel(streamingTitle, isRecord);
      const streamingWithAd = await streamingRestDAO.getChannelInfo(channelIdWithAd);

      const channelIdWithOutAd = await streamingRestDAO.createChannel(streamingTitle, isRecord);
      const streamingWithOutAd = await streamingRestDAO.getChannelInfo(channelIdWithOutAd);

      streamingWithAd.category = category;
      streamingWithOutAd.category = category;

      await Redis.client.set(sessionId + '_streamingWithAd', JSON.stringify(streamingWithAd));
      await Redis.client.set(sessionId + '_streamingWithOutAd', JSON.stringify(streamingWithOutAd));

      return 'success';
    } catch (error) {
      console.log('[StreamingService addStreaming] error = ', error);
      return 'fail';
    }
  }

  
  async getServiceUrlAndThumbnail(sessionId) {
    try {
      const {channelIdWithAd, channelIdWithOutAd} = await this.getChannelIdBySessionId(sessionId);

      const serviceUrlWithAd = await streamingRestDAO.getServiceUrl(channelIdWithAd);
      const thumnailUrlWithAd = await streamingRestDAO.getThumbnail(channelIdWithAd);
  
      const serviceUrlWithOutAd = await streamingRestDAO.getServiceUrl(channelIdWithOutAd);
      const thumnailUrlWithOutAd = await streamingRestDAO.getThumbnail(channelIdWithOutAd);
  
      if(((serviceUrlWithAd != 'fail') && (thumnailUrlWithAd != 'fail') && (serviceUrlWithOutAd != 'fail') && (thumnailUrlWithOutAd != 'fail'))) {
        console.log('[StremaingService getServiceUrlAndThumbnail] typeof serviceUrlWithAd = ', typeof serviceUrlWithAd);
        await Redis.client.set(sessionId + '_serviceUrlWithAd', serviceUrlWithAd);
        await Redis.client.set(sessionId + '_thumbnailUrlWithAd', thumnailUrlWithAd);
  
        await Redis.client.set(sessionId + '_serviceUrlWithOutAd', serviceUrlWithOutAd);
        await Redis.client.set(sessionId + '_thumbnailUrlWithOutAd', thumnailUrlWithOutAd);
        return 'success';
      }
    } catch (error) {
      console.log('[StremaingService getServiceUrlAndThumbnail] error = ', error);
      return 'fail';
    }
  }

  async getChannelIdBySessionId(sessionId) {
    const streamingWithAd = await Redis.client.get(sessionId + '_streamingWithAd');
    const streamingWithOutAd = await Redis.client.get(sessionId + '_streamingWithOutAd');

    const dataWithAd = JSON.parse(streamingWithAd);
    const dataWithOut = JSON.parse(streamingWithOutAd);
  
    const channelIdWithAd = dataWithAd.content['channelId'];
    const channelIdWithOutAd = dataWithOut.content['channelId'];

    return {channelIdWithAd, channelIdWithOutAd};
  }

  /* 
  1.Redis에서 streaming과 관련된 모든 정보 가져온다
  2. 해당 정보로 최종 스트리밍 정보인 _onStreaming 생성
  3. _onStreaming만 redis에 저장하고 나머지 정보 삭제
  */
  async getMyStreamingPage(sessionId) {
    try {
      let user = await Redis.client.get(sessionId + '_user');

      const streamingWithAd = await Redis.client.get(sessionId + '_streamingWithAd');
      const serviceUrlWithAd = await Redis.client.get(sessionId + '_serviceUrlWithAd');
      const thumnailUrlWithAd = await Redis.client.get(sessionId + '_thumbnailUrlWithAd');

      const streamingWithOutAd = await Redis.client.get(sessionId + '_streamingWithOutAd');
      const serviceUrlWithOutAd = await Redis.client.get(sessionId + '_serviceUrlWithOutAd');
      const thumnailUrlWithOutAd = await Redis.client.get(sessionId + '_thumbnailUrlWithOutAd');

      
      if(user) {
        user = JSON.parse(user);
        const userId = user.userId;
        const _onStreaming = this.createStreamingObject(user, streamingWithAd, streamingWithOutAd, serviceUrlWithAd, serviceUrlWithOutAd, thumnailUrlWithAd, thumnailUrlWithOutAd);
        

        Redis.client.del(sessionId + '_streamingWithAd');
        Redis.client.del(sessionId + '_streamingWithOutAd');
        Redis.client.del(sessionId + '_serviceUrlWithAd');
        Redis.client.del(sessionId + '_serviceUrlWithOutAd');
        Redis.client.del(sessionId + '_thumbnailUrlWithAd');
        Redis.client.del(sessionId + '_thumbnailUrlWithOutAd');

        const pk = await streamingDAO.addStreaming(_onStreaming);
        _onStreaming.streamingPk = pk;

        await Redis.client.set(userId+ '_onStreaming', JSON.stringify(_onStreaming));
        return _onStreaming;
      } else {
        return 'fail';
      }
      
    } catch (error) {
      console.log('[StreamingService getMyStreamingPage] error = ', error);
      return 'fail'
    }
  }

  async getStreamingViewerPage(sessionId, streamingUserId) {
    try {
      const isLogin = await this.isLogin(sessionId);
      const isBlackList = await this.isBlackList(sessionId, streamingUserId);
      const isHavingTicket = await this.isHavingTicket(sessionId);
  
      console.log('[StreamingService getStreamingViewerPage] isLogin = ', isLogin);
      console.log('[StreamingService getStreamingViewerPage] isBlackList = ', isBlackList);
      console.log('[StreamingService getStreamingViewerPage] isHavingTicket = ', isHavingTicket);

      if(isLogin && isBlackList) {
        const streaming = JSON.parse(await Redis.client.get(streamingUserId + '_onStreaming'));
        
        let response;
        if(isHavingTicket) {
          response = {
            streaming : streaming,
            serviceUrl : streaming.serviceUrlWithOutAd
          }
        }else {
          response = {
            streaming : streaming,
            serviceUrl : streaming.serviceUrlWithAd
          }
        }
  
        return response;
      }else {
        if(isLogin == false) {
          return 1;
        }
  
        if(isBlackList == false) {
          return 2;
        }
      }
    } catch (error) {
      console.log('[StreamingService getStreamingViewerPage] error = ', error);
    }
  }

  //진행중인 스트리밍 목록 가져오기
  async getStreamingList() {
    const streamingList = [];
    
    try {
      const keys = await Redis.client.keys('*_onStreaming');
  
      for (const key of keys) {
        const streaming = await Redis.client.get(key);
        streamingList.push(streaming);
      }
    } catch (error) {
      console.log('[StreamingService getStreamingList] error = ', error);
    }
  
    return streamingList;
  }

  async updateStreamingTitle(sessionId, newTitle) {

    console.log('[StreamingService updateStreamingTitle] sessionId = ', sessionId);
    const result = JSON.parse(await this.isStreamingOwner(sessionId));

    console.log('[StreamingService updateStremaingTitle] result = ', result);
    if(result) {
      result.streamingTitle = newTitle;

      console.log('[StreamingService udpateStreamingTitle] result = ', result);
      const userId = JSON.parse(await Redis.client.get(sessionId + '_user')).userId;
      Redis.client.set(userId + '_onStreaming', JSON.stringify(result));
      
      return 'success';
    }

    return 'fail';
  }

  async updateStreamingCategory(sessionId, newCategory) {
    const result = JSON.parse(await this.isStreamingOwner(sessionId));

    if(result) {
      result.streamingCategory = newCategory;

      const userId = JSON.parse(await Redis.client.get(sessionId + '_user')).userId;
      Redis.client.set(userId + '_onStreaming', JSON.stringify(result));
      
      return 'success';
    }
    return 'fail';
  }

  async finishStreaming(sessionId) {
    try {
      const isStreamingOwner = await this.isStreamingOwner(sessionId);
  
      if(isStreamingOwner) {
        const reocordUrl = await this.finishRecord(sessionId);
        console.log('[StreamingService finishStreaming] recordUrl = ', reocordUrl);

        await this.stopStreaming(sessionId);
        await this.removeStreaming(sessionId);
        await this.removeCDN(sessionId);

        const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
        const streaming = JSON.parse((await Redis.client.get(userId + '_onStreaming')));
        
        streaming.recordUrl = reocordUrl;
        console.log('[StremaingService finishStreaming] recordUrl = ', reocordUrl);
        
        streamingDAO.finishStreaming(streaming);
        return streaming;
      }

      return 'fail';
    } catch (error) {
      console.log('[StreamingService finishStreaming] error = ', error);
    }
  }

  async finishRecord(sessionId) {
    try {
      const user = await Redis.client.get(sessionId + '_user');
      console.log('[StreamingService finishRecord] user = ', user);

      if(user) {
        const userId = JSON.parse(user).userId;
        console.log('[StreamingService finishRecord] userId = ', userId);

        const streaming = JSON.parse(await Redis.client.get(userId + '_onStreaming'));
        console.log('[StreamingService finishRecord] streaming = ', streaming);

        const result = await streamingRestDAO.finishRecord(streaming.channelIdWithOutAd);
        console.log('[StreamingService finishRecord] result = ', result);

        if(result.content) {
          const recordList = result.content.recordList;
          
          const map = new Map(Object.entries(recordList));
          const recordUrl = map.values().next().value;

          console.log('[StreamingService finishRecord] recordUrl = ', recordUrl.fileName);
          return recordUrl.fileName;
        }
      }
      return 'fail';
    } catch (error) {
      console.log('[StreamingService finishStreaming] error = ', error);
    }
  }

  async stopStreaming(sessionId) {
    try {
      const user = await Redis.client.get(sessionId + '_user');

      if(user) {
        const userId = JSON.parse(user).userId;
        const streaming = await Redis.client.get(userId + '_onStreaming');

        if(streaming) {
          const channelIdWithAd = JSON.parse(streaming).channelIdWithAd;
          const channelIdWithOutAd = JSON.parse(streaming).channelIdWithOutAd;

          await streamingRestDAO.stopStreaming(channelIdWithAd);
          await streamingRestDAO.stopStreaming(channelIdWithOutAd);
        }
      }
    } catch (error) {
      console.log('[StreamingService stopStreaming] error = ', error);
    }
  }

  async delStreaming(sessionId) {
    const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
    
    await Redis.client.del(userId + '_onStreaming');
  }
  
  /* 
  1. 회원인지 체크
  2. 회원이면 다음 로직 수행
  3. 회원이 아니면 false 반환
  */
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

  async isStreaming(sessionId) {
    const user = await Redis.client.get(sessionId + '_user');
    let flag = false;

    if(user) {
      const userId = JSON.parse(user).userId;

      const streaming = Redis.client.get(userId + '_onStreaming');
      if(streaming) {
        flag = true;
      }
    }

    return flag;
  }

  async isStreamingOwner(sessionId) {
    const user =  await Redis.client.get(sessionId + '_user')
    
    if(user) {
      const userId = JSON.parse(user).userId;
      if(userId != null && userId != undefined) {
        const streaming = Redis.client.get(userId + '_onStreaming');
  
        if(streaming != null && streaming != undefined) {
          return streaming;
        }
      }
    }    
    return false;
  }

  async isAdmin(sessionId) {
    const roll = JSON.parse(await Redis.client.get(sessionId + 'user')).roll;
    console.log('[StreamingService isAdmin] roll = ', roll);
    console.log('[StreamingService isAdmin] typeof roll = ', typeof roll);

    if(roll == 'admin') {
      return true;
    }

    return false;
  }
  
  async validateUserStRole(sessionId) {
    const user = JSON.parse(await Redis.client.get(sessionId + '_user'));
    
    let stRoll;
    if(user) {
      stRoll = (user).stRoll;
      return stRoll
    }
    
    return stRoll;
  }

  async removeStreaming(sessionId) {
    const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
  
    const channelIdWithAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).channelIdWithAd;
    const channelIdWithOutAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).channelIdWithOutAd;
    
    streamingRestDAO.removeStreaming(channelIdWithAd);
    streamingRestDAO.removeStreaming(channelIdWithOutAd);
  }

  async removeCDN(sessionId) {
    try {
      const user = await Redis.client.get(sessionId + '_user');

      if(user) {
        const userId = JSON.parse(user).userId;

        const instanceNoWithAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).instanceNoWithAd;
        const instanceNoWithOutAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).instanceNoWithOutAd;


        console.log('[StreamingService removeCDN] instanceNoWithAd = ', instanceNoWithAd);
        console.log('[StreamingService removeCDN] instanceNoWithOutAd = ', instanceNoWithOutAd);

        streamingRestDAO.removeCDN(instanceNoWithAd);
        streamingRestDAO.removeCDN(instanceNoWithOutAd);
      }
    } catch (error) {
      console.log('[StreamingService removeCDN] error = ', error);
    }
  }

  async getChannelWithAdList() {
    const streamingList = await Redis.client.keys('*_onStreaming');
    
    let channelIdWithAdList = [];

    for(const streaming of streamingList) {
      const streamingObject = JSON.parse(await Redis.client.get(streaming));
      channelIdWithAdList.push(streamingObject.channelIdWithAd);
    }
    
    return channelIdWithAdList
  }

  createStreamingObject(user, streamingWithAd, streamingWithOutAd, serviceUrlWithAd, serviceUrlWithOutAd, thumnailUrlWithAd, thumnailUrlWithOutAd) {
    try {
      const userId = user.userId;
      const blackList = user.blackList;
      const streamingObjectWithAd = JSON.parse(streamingWithAd);
      const streamingObjectWithOutAd = JSON.parse(streamingWithOutAd);
        
      const _onStreaming = {
        'userId' : userId,
  
        'channelIdWithAd' : streamingObjectWithAd.content.channelId,
        'channelIdWithOutAd' : streamingObjectWithOutAd.content.channelId,
  
        'instanceNoWithAd' : streamingObjectWithAd.content.instanceNo,
        'instanceNoWithOutAd' : streamingObjectWithOutAd.content.instanceNo,
  
        'streamingCategory' : streamingObjectWithAd.category,
        'streamingTitle' : streamingObjectWithAd.content.channelName,
        'streamingStartTime' : moment().format('YYYY-MM-DD/HH:mm'),
        'streamingEndTime' : '',
        'totalStreamingViewer' : 0,
        'streamingViewer' : 0,
  
        'publishUrlWithAd' : streamingObjectWithAd.content.publishUrl,
        'streamKeyWithAd' : streamingObjectWithAd.content.streamKey,
        'serviceUrlWithAd' : serviceUrlWithAd,
        'thumnailUrlWithAd' : thumnailUrlWithAd,
  
        'publishUrlWithOutAd' : streamingObjectWithOutAd.content.publishUrl,
        'streamKeyWithOutAd' : streamingObjectWithOutAd.content.streamKey,
        'serviceUrlWithOutAd' : serviceUrlWithOutAd,
        'thumnailUrlWithOutAd' : thumnailUrlWithOutAd,

        'blackList' : blackList,
        'viewerList' : new Set()
      };
      return _onStreaming;
    } catch (error) {
      console.log('[StreamingService createStreamingObject] error = ', error);
      throw new Error('[StreamingService createStreamingObject error]');
    }
  }  

  async isBlackList(sessionId, streamingUserId) {
    try {
      let viewer = await Redis.client.get(sessionId + '_user');
      let streaming = await Redis.client.get(streamingUserId + '_onStreaming');

      let flag = false;
      if(viewer && streaming) {
        const userId = JSON.parse(viewer).userId;
        const blackList = JSON.parse(streaming).blackList;
        
        
        if((!blackList.includes(userId))) {
          flag = true;
        }
      }
      return flag;
    } catch (error) {
      console.log('[StreamingService isBlackList] error = ', error);
    }
  }

  async isHavingTicket(sessionId) {
    const user = await Redis.client.get(sessionId + '_user');
    let flag = false;
    
    if(user) {
      const userId = JSON.parse(user).userId;
      const ticketList = await userDAO.getUserTicket(userId);
      console.log('[StreamingService isHavingTicket] ticketList = ', ticketList);

      if(ticketList.length > 0) {
        flag = true;
      }
    }

    return flag;
  }
  
  async nonUserGetStreamingViewerPage(streamingUserId) {
    let streaming = await Redis.client.get(streamingUserId + '_onStreaming');

    if(streaming) {
      streaming = JSON.parse(streaming);
      
      const response = {
        streaming : streaming,
        serviceUrl : streaming.serviceUrlWithAd
      }

      return response;
    }

    return 'fail';
  }
}


module.exports = StreamingService;