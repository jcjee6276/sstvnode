const StreamingDAO = require('../DAO/StreamingDAO');
const Redis = require('../model/Redis');

class StreamingService {
  streamingDAO = new StreamingDAO();

  /* 
  1. 회원인지 체크
  2. 회원이 아니면 1 반환
  3. 이미 스트리밍중이였는지 체크
  4. 이미 스트리밍중이였으면 2 반환
  5. 채널생성에 성공하면 0반환
  */
 async addStreaming(streamingTitle, sessionId, isRecord) {
    const isLogin =  await this.isLogin(sessionId);
    const isStreaming =  await this.isStreaming(sessionId);

    if(isLogin && isStreaming) {
      const channelId = await this.streamingDAO.createChannel(streamingTitle, isRecord);
      const streaming = await this.streamingDAO.getChannelInfo(channelId);
      console.log('[StreamingService addStreaming] streaming = ', streaming);

      
      Redis.client.set(sessionId + '_streaming', streaming);
      return 0;
    } else {
      if(isLogin == false) {
        return 1;
      }

      if(isStreaming == false) {
        return 2;
      }
    }
  }

  
  async getServiceUrl(sessionId) {
    const channelId = await this.getChannelIdBySessionId(sessionId);
    console.log('[StreamingService getServiceUrl] channelId = ', channelId);

    const serviceUrl = await this.streamingDAO.getServiceUrl(channelId);
    
    return serviceUrl;
  }


  async getChannelIdBySessionId(sessionId) {
    const streaming = await Redis.client.get(sessionId + '_streaming');
    console.log('[StreamingService getChannelIdBySessionId] streaming = ', streaming);

    const data = JSON.parse(streaming);
  
    const channelId = data.content['channelId'];
    return channelId;
  }

  async getStremaing(sessionId) {
    const user = await Redis.client.get(sessionId);
    const streaming = await Redis.client.get(sessionId + '_streaming');
    const serviceUrl = await Redis.client.get(sessionId + '_serviceUrl');

    const data = {
      'user' : user,
      'streaming' : streaming,
      'serviceUrl' : serviceUrl 
    }

    return data;
  }
  

  /* 
  1. 회원인지 체크
  2. 회원이면 다음 로직 수행
  3. 회원이 아니면 false 반환
  */
  async isLogin(sessionId) {
    if(sessionId == null || sessionId == undefined) {
      return false;
    }

    const user =  await Redis.client.get(sessionId);
    
    if(user == null || user == undefined) {
      return false;
    }
    return true;
  }

  /* 
  1. redis에 스트리밍 정보가 있는지 체크
  2. 스트리밍 정보가 없으면 true
  3. 스트리밍 정보가 있으면 false
  */
  async isStreaming(sessionId) {
    if(sessionId == null || sessionId == undefined) {
      return false;
    }

    const streaming = await Redis.client.get(sessionId + '_streaming');
    
    if(streaming == null || streaming == undefined) {
      return true;
    }  
    return false;
  }
}

module.exports = StreamingService;