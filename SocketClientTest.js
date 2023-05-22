const io = require('socket.io-client');
const socket = io('http://localhost:3000');


const roomName = 'user1'
const dataToSend = {
  userId : 'user1'
}



socket.emit('join_room', {roomName, data : dataToSend});
socket.emit('updateStreamingTitle', {roomName, data : dataToSend});
socket.emit('updateStreamingCategory', {roomName, data : dataToSend});

socket.on('update_streamingViewer', (data) => {
  console.log('[socketClientTest update_streamingViewer] data = ', data);
});

socket.on('update_totalStreamingViewer', (data) => {
  console.log('[socketClientTest update_totalStreamingViewer] data = ', data);
});

socket.on('updateStreamingTitle', (data) => {
  console.log('[socketClientTest updateStreamingTitle] data = ', data);
});

socket.on('updateStreamingCategory', (data) => {
  console.log('[socketClientTest updateStreamingCategory] data = ', data);
});



