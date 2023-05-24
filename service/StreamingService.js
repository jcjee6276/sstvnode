const e = require('cors');
const streamingRestDAO = require('../DAO/StreamingRestDAO');
const Redis = require('../model/Redis');
const streamingDAO = new (require('../DAO/StreamingDAO'))();

class StreamingService {
  streamingRestDAO = new streamingRestDAO();

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
      const channelIdWithAd = await this.streamingRestDAO.createChannel(streamingTitle, isRecord);
      const streamingWithAd = await this.streamingRestDAO.getChannelInfo(channelIdWithAd);

      const channelIdWithOutAd = await this.streamingRestDAO.createChannel(streamingTitle, isRecord);
      const streamingWithOutAd = await this.streamingRestDAO.getChannelInfo(channelIdWithOutAd);

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

      const serviceUrlWithAd = await this.streamingRestDAO.getServiceUrl(channelIdWithAd);
      const thumnailUrlWithAd = await this.streamingRestDAO.getThumbnail(channelIdWithAd);
  
      const serviceUrlWithOutAd = await this.streamingRestDAO.getServiceUrl(channelIdWithOutAd);
      const thumnailUrlWithOutAd = await this.streamingRestDAO.getThumbnail(channelIdWithOutAd);
  
      if(((serviceUrlWithAd != 'fail') && (thumnailUrlWithAd != 'fail') && (serviceUrlWithOutAd != 'fail') && (thumnailUrlWithOutAd != 'fail'))) {
        // const serviceUrlWithAd = sessionId + '_serviceUrlWithAd'
        // const thumbnailWithAd = sessionId + '_thumbnailUrl'
  
        // const serviceUrlWithOutAd = sessionId + '_serviceUrlWithAd'
        // const thumnailUrlWithOutAd = sessionId + '_thumbnailUrl'
  
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
  async getStremaing(sessionId) {
    try {
      const user = await Redis.client.get(sessionId + '_user');

      const streamingWithAd = await Redis.client.get(sessionId + '_streamingWithAd');
      const serviceUrlWithAd = await Redis.client.get(sessionId + '_serviceUrlWithAd');
      const thumnailUrlWithAd = await Redis.client.get(sessionId + '_thumbnailUrlWithAd');

      const streamingWithOutAd = await Redis.client.get(sessionId + '_streamingWithOutAd');
      const serviceUrlWithOutAd = await Redis.client.get(sessionId + '_serviceUrlWithOutAd');
      const thumnailUrlWithOutAd = await Redis.client.get(sessionId + '_thumbnailUrlWithOutAd');


      const userId = JSON.parse(user).userId;
      
      const _onStreaming = this.createStreamingObject(user, streamingWithAd, streamingWithOutAd, serviceUrlWithAd, serviceUrlWithOutAd, thumnailUrlWithAd, thumnailUrlWithOutAd);

      Redis.client.del(sessionId + '_streamingWithAd');
      Redis.client.del(sessionId + '_streamingWithOutAd');
      Redis.client.del(sessionId + '_serviceUrlWithAd');
      Redis.client.del(sessionId + '_serviceUrlWithOutAd');
      Redis.client.del(sessionId + '_thumbnailUrlWithAd');
      Redis.client.del(sessionId + '_thumbnailUrlWithOutAd');

      const pk = await streamingDAO.addStreaming(_onStreaming);
      console.log('[StreamingService getStremaing] pk = ', pk);
      _onStreaming.streamingPk = pk;

      await Redis.client.set(userId+ '_onStreaming', JSON.stringify(_onStreaming));
      return _onStreaming;
    } catch (error) {
      console.log('[StreamingService getStreaming] error = ', error);
      return 'fail'
    }
  }

  async getStreamingByUserId(userId) {
    const streaming = await Redis.client.get(userId + '_onStreaming');

    if(streaming == null || streaming == undefined) {
      return 'fail';
    }

    return streaming;
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
    const isStreamingOwner = await this.isStreamingOwner(sessionId);
  
    if(isStreamingOwner) {
      await this.sendStreamingToSpring(sessionId);
      await this.removeStreaming(sessionId);
      await this.removeCDN(sessionId);

      const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
      const streaming = JSON.parse((await Redis.client.get(userId + '_onStreaming')));
      
      return streaming;
    }

    return 'fail';
  }

  async delStreaming(sessionId) {
    const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
    
    await Redis.client.del(userId + '_onStreaming');
  }
  

  //스트리밍 종료시간 설정 후 springServer로 진행한 스트리밍 정보 전송
  async sendStreamingToSpring(sessionId) {
    const date = new Date();

    const userId = (JSON.parse(await Redis.client.get(sessionId + '_user'))).userId;
    const streaming = JSON.parse(await Redis.client.get(userId + '_onStreaming'));
    streaming.streamingEndTime = date.toFormat('YYYY-MM-DD/HH24:MI');
    
    await Redis.client.set(userId + '_onStreaming', JSON.stringify(streaming));
    
    return await this.streamingRestDAO.sendStreamingToSpring(streaming);
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
    sessionId = sessionId + "_streamingWithAd";
  
    if(sessionId == null || sessionId == undefined) {
      return false;
    }

    const streaming = await Redis.client.get(sessionId);
    
    if(streaming == null || streaming == undefined) {
      return true;
    }  
    return false;
  }

  async isStreamingOwner(sessionId) {
    const userId = JSON.parse(await Redis.client.get(sessionId + '_user')).userId;

    if(userId != null && userId != undefined) {
      const streaming = Redis.client.get(userId + '_onStreaming');

      if(streaming != null && streaming != undefined) {
        return streaming;
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
    const stRoll = (JSON.parse(await Redis.client.get(sessionId + '_user'))).stRoll;
    return stRoll;
  }

  async removeStreaming(sessionId) {
    const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;
  
    const channelIdWithAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).channelIdWithAd;
    const channelIdWithOutAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).channelIdWithOutAd;
    
    this.streamingRestDAO.removeStreaming(channelIdWithAd);
    this.streamingRestDAO.removeStreaming(channelIdWithOutAd);
  }

  async removeCDN(sessionId) {
    const userId = JSON.parse((await Redis.client.get(sessionId + '_user'))).userId;

    const instanceNoWithAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).instanceNoWithAd;
    const instanceNoWithOutAd = JSON.parse((await Redis.client.get(userId + '_onStreaming'))).instanceNoWithOutAd;

    this.streamingRestDAO.removeCDN(instanceNoWithAd);
    this.streamingRestDAO.removeCDN(instanceNoWithOutAd);
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
    // const date = new Date();

    const userId = JSON.parse(user).userId
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
      'streamingStartTime' : Date.now(),
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

      'viewerList' : new Set()
    };

    return _onStreaming;
  }  
}


module.exports = StreamingService;