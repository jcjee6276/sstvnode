// 네이버 음성합성 Open API 예제
var request = require('request');
var fs = require('fs');


class DonationRestDAO {

  async textToMp3(content, voiceType) {
    try {
      var api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    
      var options = {
        url: api_url,
        form: { speaker: voiceType, volume: '0', speed: '0', pitch: '0', text : content, format: 'mp3' },
        headers: { 'X-NCP-APIGW-API-KEY-ID': global.clientId, 'X-NCP-APIGW-API-KEY': global.clientSecret },
      };
      var writeStream = fs.createWriteStream('./public/donation/test.mp3');
      var _req = await request.post(options).on('response', function(response) {
        console.log('[DonationRestDAO textToMp3] response = ', response);
      });
      const stream = _req.pipe(writeStream); // file로 출력
      // const browser = _req.pipe(res); // 브라우저로 출력

      console.log('[DonationRestDAO textToMp3] stream = ', stream);
      // console.log('[DonationRestDAO browser] browser = ', browser);
    } catch (error) {
      console.log('[DonationRestDAO textToMp3] error = ', error);
    }
  }
}

module.exports = DonationRestDAO;
