const io = require('socket.io-client');
const socket = io('http://localhost:3000');


const roomName = 'user3'
const dataToSend = {
  userId : '이동욱'
}

function joinRoom() {
  socket.emit('join_room', {roomName, data : dataToSend});
}

async function leaveRoom() {
  await socket.emit('leave_room', {roomName, data : dataToSend});
  socket.disconnect();
}

joinRoom();
// setTimeout(() => {
//   leaveRoom();
// }, 10000);



// socket.emit('updateStreamingTitle', {roomName, data : dataToSend});
// socket.emit('updateStreamingCategory', {roomName, data : dataToSend});

socket.on('join_room', (data) => {
  const streamingViewer = data.streamingViewer
  const totalStreamingViewer = data.totalStreamingViewer

  console.log('[socketClientTest join_room] 현재 시청자수 = ', streamingViewer);
  console.log('[socketClientTest join_room] 누적 시청자수 = ', totalStreamingViewer);
});

socket.on('updateStreamingTitle', (data) => {
  console.log('[socketClientTest updateStreamingTitle] 실시간 제목 = ', data);
});

socket.on('updateStreamingCategory', (data) => {
  console.log('[socketClientTest updateStreamingCategory] 실시간 카테고리 = ', data);
});

socket.on('leave_room', (data) => {
  console.log('[socketClientTest leave_room] 현재 시청자수 = ', data.streamingViewer);
});



