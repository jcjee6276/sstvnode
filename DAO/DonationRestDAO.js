// 네이버 음성합성 Open API 예제
var request = require('request');
var fs = require('fs');


class DonationRestDAO {

  textToMp3(content) {
    var api_url = 'https://naveropenapi.apigw.ntruss.com/tts-premium/v1/tts';
    
    var options = {
      url: api_url,
      form: { speaker: 'nara', volume: '0', speed: '0', pitch: '0', text : content, format: 'mp3' },
      headers: { 'X-NCP-APIGW-API-KEY-ID': global.clientId, 'X-NCP-APIGW-API-KEY': global.clientSecret },
    };
    var writeStream = fs.createWriteStream('./tts1.mp3');
    var _req = request.post(options).on('response', function(response) {
      console.log(response.statusCode); // 200
      console.log(response.headers['content-type']);
    });
    const stream = _req.pipe(writeStream); // file로 출력
    // const browser = _req.pipe(res); // 브라우저로 출력

    console.log('[DonationRestDAO textToMp3] stream = ', stream);
    // console.log('[DonationRestDAO browser] browser = ', browser);
  }
}

module.exports = DonationRestDAO;
