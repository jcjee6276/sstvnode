const CryptoJS = require('crypto-js');
const request = require('request');

class StreamingDAO {

  //스트리밍 채널 생성
  createChannel(streamingTitle, isRecord) {
    const url = "https://livestation.apigw.ntruss.com/api/v2/channels";
    const timestamp = Date.now().toString();
    const method = "POST";
    const signature = this.makeSignature(method, url, timestamp);

    let record;
    let immediateOnAir;
    if(isRecord) {
      record = {
        "type" : "AUTO_UPLOAD",
        "format" : "MP4",
        "bucketName" : "hls",
        "filePath" : "/livestation",
        "accessControl" : "PRIVATE"
      }

      immediateOnAir = true;
    }else {
      record = {
        "type" : "NO_RECORD"
      }

      immediateOnAir = false;
    }
  
    const option = {
      url : url,
      method : method, 
      headers : {
        'Content-Type' : 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp' : timestamp,
        'x-ncp-iam-access-key' : global.accessKey,
        'x-ncp-apigw-signature-v2' : signature,
        'x-ncp-region_code' : 'KR'
      },
      body : JSON.stringify({
        "channelName" : streamingTitle,
        "cdn" : {
          "createCdn" : true,
          "cdnType" : "CDN_PLUS"
        },
        "qualitySetId" : 3,
        "useDvr" : true,
        "immediateOnAir" : immediateOnAir,
        "timemachineMin" : 360,
        "record" : record,
        "isStreamFailOver" : true
      })
    }
  
    return new Promise((resolve, reject) => {
      request(option, (error, response, body) => {
        if(error) {
          console.log("error = ", error);
          reject("error");
        }
        
        try {
          const json = JSON.parse(body);          
          const channelId = json.content['channelId']; 
          resolve(channelId);
        } catch (error) {
          console.log('[StreamingDAO createChannel] error = ', error);
          resolve(error);
        }
      });
    });
  }

  //스트리밍 채널의 정보 가져옴
  getChannelInfo(channelId) {
    const url = "https://livestation.apigw.ntruss.com/api/v2/channels/" + channelId;
    const timestamp = Date.now().toString();
    const method = "GET";
    const signature = this.makeSignature(method, url, timestamp);
  
    const option = {
      url : url,
      method : method,
      headers : {
        'x-ncp-apigw-timestamp' : timestamp,
        'x-ncp-iam-access-key' : global.accessKey,
        'x-ncp-apigw-signature-v2' : signature,
        'x-ncp-region_code' : 'KR'
      }
    }

    return new Promise((resolve, rejcet) => {
      request(option, (error, response, body) => {
        if(error) {
          reject(error);
        }
        resolve(body);
      });
    });

    
  }

  //스트리밍의 ServiceURL을 가져옴
  async getServiceUrl(channelId) {
    const serviceUrlType = 'GENERAL';

    const url = `https://livestation.apigw.ntruss.com/api/v2/channels/${channelId}/serviceUrls?serviceUrlType=${serviceUrlType}`;
    const timestamp = Date.now().toString();
    const method = "GET";
    const signature = this.makeSignature(method, url, timestamp);

    const option = {
      url : url,
      method : method, 
      headers : {
        'Content-Type' : 'application/json; charset=utf-8',
        'x-ncp-apigw-timestamp' : timestamp,
        'x-ncp-iam-access-key' : global.accessKey,
        'x-ncp-apigw-signature-v2' : signature,
        'x-ncp-region_code' : 'KR'
      }
    }
    
    return new Promise(async (resolve, rejcet) => {
      request(option, (error, response, body) => {
        if(error) {
          console.log('[StreamingDAO getServiceUrl] error = ', error);
          reject(error);
        }
                
        try {
          const serviceURL = JSON.parse(body).content[0].url  
          resolve(serviceURL);
        } catch (error) {
          console.log('[StreamingDAO getServiceUrl] error = ', error);
          resolve('fail');
        }
      });
    });
  }

  //API 요청 헤더 생성
  makeSignature(method, url, timestamp) {
    var space = " ";
    var newLine = "\n";
  
    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, global.secretKey); // secret key
    hmac.update(method);		// HTTP 메서드
    hmac.update(space);		// 공백
    hmac.update(this.createUrlForSignature(url));		// 도메인을 제외한 "/" 아래 전체 url (쿼리스트링 포함)
    hmac.update(newLine);		// 줄바꿈
    hmac.update(timestamp);		// 현재 타임스탬프 (epoch, millisecond)
    hmac.update(newLine);		// 줄바꿈
    hmac.update(global.accessKey);		// access key (from portal or iam)
  
    var hash = hmac.finalize(); 
  
    return hash.toString(CryptoJS.enc.Base64);
  }
  
  createUrlForSignature(url) { 
    return url.substring(url.indexOf('com') + 3);
  }
}

module.exports = StreamingDAO;