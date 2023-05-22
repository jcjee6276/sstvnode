const SocketClient = require('./SocketClient');
const socketClient = new SocketClient();

const count = socketClient.getRoomSocketCount('이동욱');

console.log('count = ', count);