const request = require('request');
var fs = require('fs');
const { v4 } = require('uuid');
const AWS = require('aws-sdk');
const Jimp = require('jimp');
const { error, timeStamp } = require('console');
const CryptoJS = require('crypto-js');
const { response } = require('express');
const endpoint = new AWS.Endpoint('https://kr.object.ncloudstorage.com');
const region = 'kr-standard';
const mediaPath = 'public/donation/';



class DonationDAO {
  async textToImg(text, uuid) {
    // 폰트 로드
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  
    // 원하는 이미지 크기 설정
    const imageWidth = 400;
    const imageHeight = 200;
  
    // 저장할 파일 경로 및 이름 설정
    const fileName = uuid + '.png';
  
    // 새로운 이미지 생성 (투명 배경)
    const image = new Jimp(imageWidth, imageHeight, 0x00000000);
  
    // 이미지에 텍스트 추가 (흰색 폰트)
    const textOptions = {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    };
  
    // 텍스트를 이미지 중앙에 맞추기 위해 텍스트 크기와 이미지 크기 비교
    const textWidth = Jimp.measureText(font, text);
    const textHeight = Jimp.measureTextHeight(font, text, imageWidth);
    const textX = (imageWidth - textWidth) / 2;
    const textY = (imageHeight - textHeight) / 2;
  
    // 이미지에 텍스트 추가
    image.print(font, textX, textY, textOptions, imageWidth, imageHeight);
  
    // 이미지 저장
    await image.writeAsync(mediaPath + fileName);
  
    return fileName;
  }
  

  async textToMp3(inputText, uuid) {
    var client_id = global.accessKey;
    var client_secret = global.secretKey;
  
    var api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    var options = {
      url: api_url,
      form: { speaker: 'nara', volume: '0', speed: '0', pitch: '0', text: inputText, format: 'mp3' },
      headers: { 'X-NCP-APIGW-API-KEY-ID': client_id, 'X-NCP-APIGW-API-KEY': client_secret },
    };
    
    const fileName = uuid + '.mp3';
    
    console.log(mediaPath + fileName);
    var writeStream = fs.createWriteStream(mediaPath + fileName);
    var _req = request.post(options).on('response', function(response) {
      console.log(response.statusCode); // 200
      console.log(response.headers['content-type']);
    });

    await _req.pipe(writeStream);

    return fileName;
  }

  async uploadFileToObjectStorage(file, fileName) {  
    try {
      const S3 = new AWS.S3({
        endpoint : endpoint,
        region : region,
        credentials : {
          accessKeyId : global.accessKey,
          secretAccessKey : global.secretKey
        }
      });
  
      const bucketName = 'donation';
  
      await S3.putObject({
        Bucket : bucketName,
        Key : fileName,
        ACL : 'public-read',
        Body : file.buffer
      }).promise();
    } catch (error) {
      console.log('[AdRestDAO uploadFileToObjectStorage] error = ', error);
    }
  }

  async removeFileFromObjectStorage(fileName) {
    try {
      const S3 = new AWS.S3({
        endpoint : endpoint,
        region : region,
        credentials : {
          accessKeyId : global.accessKey,
          secretAccessKey : global.secretKey
        }
      });
  
      const bucketName = 'donation';
  
      await S3.deleteObject({
        Bucket : bucketName,
        Key : fileName,
      }).promise();
    } catch (error) {
      console.log('[AdRestDAO removeFileToObjectStorage] error = ', error);
    }
  }

  

  async createLiveCurtain(fileName) {
    try {
      const url = 'https://livestation.apigw.ntruss.com/api/v2/curtainContents';
      const method = "POST";
      const timestamp = Date.now().toString();
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
        },
  
        body : JSON.stringify({
          content : [
            {
              'bucketName' : "donation",
              'filePath' : '/' + fileName,
              'width' : 300,
              'height' : 200
            },
          ]
        })
      };
  
      return new Promise((resolve, rejcet) => {
        request(option, (error, response, body) => {
          const bodyObject = JSON.parse(body);
          const errorCode = bodyObject.errorCode;  

          if(errorCode) {
            rejcet(bodyObject);
          } else {
            resolve(bodyObject.content.id);
          }
        });
      })
      .then((result) =>{
        console.log('[AdDAO createLiveCurtain] result = ', result);
      })
      .catch((error) => {
        console.log('[AdDAO createLiveCurtain] error = ', error);
      });
    } catch (error) {
      console.log('[AdDAO createLiveCurtain] error = ', error);
    }
  }

  async startLiveCurtain(channelId, curtainId) {
    const url = `https://livestation.apigw.ntruss.com/api/v2/channels/${channelId}/curtain/insert`;
    const method = 'POST';
    const timestamp = Date.now().toString();
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
      },
      body : JSON.stringify({
        contentId : [
          curtainId
        ],
        insertTime : 1
      })
    }
    
    request.post(option, (error, response, body) => {
      const bodyObject = JSON.parse(body);
      const errorCode = bodyObject.errorCode;

      if(errorCode) {
        console.log('[DonationDAO startLiveCurtain] errorCode = ', bodyObject);
        return;
      }
      
      console.log('[DonationDAO startLiveCurtain] bodyObject = ', bodyObject);
    });
  }

  async getLiveCurtainList() {
    const url = 'https://livestation.apigw.ntruss.com/api/v2/curtainContents?pageNo=1&pageSizeNo=15&status=READY';
    const method = 'GET';
    const timestamp = Date.now().toString();
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

    return new Promise((resolve, rejcet) => {
      request(option, (error, response, body) => {
        const bodyObject = JSON.parse(body);
        const errorCode = bodyObject.errorCode;  

        console.log('[DonationDAO getLiveCurtainList] bodyObject = ', bodyObject);
        if(errorCode) {
          console.log('[DonationDAO getLiveCurtainList] errorCode = ', bodyObject);
          return;
        }

        resolve(bodyObject);
      });
    });
  }

  async removeLiveCurtain(curtainId) {
    const url = `https://livestation.apigw.ntruss.com/api/v2/curtainContents/${curtainId}`;
    const timestamp = Date.now().toString();
    const method = "DELETE";
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

    return new Promise((resolve, rejcet) => {
      request(option, (error, response, body) => {
        const bodyObject = JSON.parse(body);
        const errorCode = bodyObject.errorCode;  

        console.log('[DonationDAO removeLiveCurtain] bodyObject = ', bodyObject);
        if(errorCode) {
          console.log('[DonationDAO removeLiveCurtain] errorCode = ', bodyObject);
          return;
        }
      });
    });
  }

  async getCurtainStatus(curtainId) {
    try {
      const url = `https://livestation.apigw.ntruss.com/api/v2/curtainContents/${curtainId}`;
      const timestamp = Date.now().toString();
      const method = 'GET';
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
      
      const result = await new Promise(async (resolve, rejcet) => {
        request(option, (error, response, body) => {
          const bodyObject = JSON.parse(body);
          const errorCode = bodyObject.errorCode;
          console.log('[AdRestDAO getCurtainStatus] bodyObject = ', bodyObject);

          if (errorCode) {
            console.log('[DonationDAO getCurtainStatus] errorCode = ', bodyObject);
            rejcet(error);
          }
     
          resolve(body);
        });
      });
      
      const status = result.content.status;
      return status;
    } catch (error) {
      console.log('[AdRestDAO getCurtainStatus] error = ', error);
    }
  }

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

module.exports = DonationDAO;