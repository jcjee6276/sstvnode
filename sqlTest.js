const streamingDAO = new (require('./DAO/StreamingDAO'))();
const Redis = require('./model/Redis');

const finishStreaming = async () => {
  const streaming = await Redis.client.get('user1_onStreaming');
  console.log('streaming = ' , streaming);
  streamingDAO.finishStreaming(JSON.parse(streaming));
}

finishStreaming();