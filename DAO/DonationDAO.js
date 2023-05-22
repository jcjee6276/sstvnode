const request = require('request');
var fs = require('fs');
const { v4 } = require('uuid');

class DonationDAO {
  async textToImg(text, uuid) {
    // 폰트 로드
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    
    // 이미지 크기 설정 (너비, 높이)
    const imageWidth = 500;
    const imageHeight = 200;
    
    // 저장할 파일 경로 및 이름 설정
    const outputPath = `./public/img/${uuid}.png`;
    
    // 새로운 이미지 생성 (투명 배경)
    const image = new Jimp(imageWidth, imageHeight, 0x00000000);
    
    // 이미지에 텍스트 추가 (흰색 폰트)
    image.print(font, 0, 0, {
      text: text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, imageWidth, imageHeight);
    
    // 이미지 저장
    await image.writeAsync(outputPath);  

    return imgName;
  }

  textToMp3(text, uuid) {
    const url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    const method = 'POST';

    const option = {
      url : url,
      method : method,
      Headers : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        "X-NCP-APIGW-API-KEY-ID" : global.clientId,
        "X-NCP-APIGW-API-KEY" : global.clientSecret,
      },
      form : {
        form: { speaker: 'nara', volume: '0', speed: '0', pitch: '0', text: '좋은 하루 되세요', format: 'mp3' }
      }
    }

    return new Promise(async (resolve, rejcet) => {
      request(option, (error, response, body) => {
        if(error) {
          console.log('[StreamingDAO removeStreaming] error = ', error);
          reject(error);
        }
        
        const bodyObject = JSON.parse(body);
        console.log('[StreamingDAO removeStreaming] bodyObject = ', bodyObject);
      });
    });
  }

  async textToMp3NAPI(inputText, uuid) {
    var client_id = 'ie3vug56gz';
    var client_secret = 'HAqoUe2ZG2GxgZDVweFjB4DicnttKodNFP2yfp6y';
  
    console.log('[DonationDAO] clientId = ', client_id);
    console.log('[DonationDAO] clientSecret = ', client_secret);

    var api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    var request = require('request');
    var options = {
      url: api_url,
      form: { speaker: 'nara', volume: '0', speed: '0', pitch: '0', text: inputText, format: 'mp3' },
      headers: { 'X-NCP-APIGW-API-KEY-ID': client_id, 'X-NCP-APIGW-API-KEY': client_secret },
    };
    
    const path = `./public/mp3/${uuid}.mp3`
    var writeStream = fs.createWriteStream(path);
    var _req = request.post(options).on('response', function(response) {
      console.log(response.statusCode); // 200
      console.log(response.headers['content-type']);
    });
    const result =  _req.pipe(writeStream); // file로 출력
  }
}

module.exports = DonationDAO;