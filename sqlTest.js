const streamingDAO = new (require('./DAO/StreamingDAO'))();
const Redis = require('./model/Redis');



async function getStermaing(){
  const streaming = JSON.parse(await Redis.client.get('user1_onStreaming'));
  console.log('streaming = ', streaming);

  const pk = await streamingDAO.addStreaming(streaming);
  console.log('pk = ', pk)
  
}

getStermaing();

