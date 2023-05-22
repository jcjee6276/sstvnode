const { JSONCookie } = require('cookie-parser');
const Redis = require('../model/Redis');
const Reids = require('../model/Redis');

const socketEventHandler = (io) => {
  try {
    io.on("connection", (socket) => {  
      console.log(`User Connected: ${socket.id}`);
    
      socket.on("join_room", async ({roomName, data}) => {
        socket.join(roomName);
        
        const{streamingViewer, totalStreamingViewer} = await updateViewer(roomName, data.userId);
  
        io.to(roomName).emit('update_streamingViewer', {streamingViewer});
        io.to(roomName).emit('update_totalStreamingViewer', {totalStreamingViewer});
      });
    
      socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
        console.log(` ${socket.id}가 보낸 메세지 : ${data}`);
      });
    
      socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
      });
  
      //실시간 스트리밍 제목 변환
      socket.on('updateStreamingTitle', async ({roomName, data}) => {
        const streamingTitle = await updateStreamingTitle(data.userId);
        io.to(roomName).emit('updateStreamingTitle', streamingTitle);
      });
  
      //실시간 카테고리 변환
      socket.on('updateStreamingCategory', async ({roomName, data}) => {
        const streamingCategory = await updateStreamingCategory(data.userId);
        io.to(roomName).emit('updateStreamingCategory', streamingCategory);
      });
    });
  } catch (error) {
    console.log('[socketHandler socketEventHandler] error = ', error);
  }
}

//스트리밍에 입장시 해당 실시간 시청자수, 누적 시청자수 증가
const updateViewer = async (roomName, userId) => {
  console.log('[socketHandler updateViewer] roomname = ', roomName);
  let on_streaming = await Reids.client.get(roomName + '_onStreaming');
  on_streaming = JSON.parse(on_streaming);
  
  
  let viewerList = Array.from(on_streaming.viewerList);
  viewerList = new Set(viewerList);
  viewerList.add(userId);

  on_streaming.viewerList = Array.from(viewerList);
  on_streaming.streamingViewer++;
  on_streaming.totalStreamingViewer = viewerList.size;

  console.log('[socketHandler updateStreamingViewer] on_streamingWithAd', on_streaming);

  await Redis.client.set(roomName + '_onStreaming', JSON.stringify(on_streaming));

  return {
    'streamingViewer' : on_streaming.streamingViewer ,
    'totalStreamingViewer' : on_streaming.totalStreamingViewer
  };
}

const updateStreamingTitle = async(userId) => {
  const streamingTitle = (JSON.parse(await Redis.client.get(userId + '_onStreaming'))).streamingTitle;
  console.log('[socketHandler updateStreamingTitle] streamingTitle = ', streamingTitle);
  return streamingTitle;
}

const updateStreamingCategory = async(userId) => {
  const streamingCategory = (JSON.parse(await Redis.client.get(userId + '_onStreaming'))).streamingCategory;
  console.log('[socketHandler updateStreamingCategory] streamingCategory = ', streamingCategory);
  return streamingCategory;
}

module.exports = socketEventHandler;