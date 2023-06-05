const io = require('socket.io-client');
const socket = io('http://localhost:3001');


const roomName = 'user5'
const dataToSend = {
  userId : '이동욱'
}

function joinRoom() {
  socket.emit('join_room', {roomName, data : dataToSend});
}

socket.on('join_room', (data) => {
  const streamingViewer = data.streamingViewer
  const totalStreamingViewer = data.totalStreamingViewer

  console.log('[socketClientTest join_room] 현재 시청자수 = ', streamingViewer);
  console.log('[socketClientTest join_room] 누적 시청자수 = ', totalStreamingViewer);
});

socket.on('receive_donation', (data) => {
  const fileUrl = data.fileUrl;
  const donationMent = data.donationMent;

  console.log('fileUrl = ', fileUrl);
  console.log('donationMent = ', donationMent);  
  console.log('[SocketClientA socket.on(receive_donation)] donationMent = ', donationMent);
});

joinRoom();




