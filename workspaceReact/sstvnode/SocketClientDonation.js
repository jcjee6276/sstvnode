const io = require('socket.io-client');
const socket = io('http://localhost:3001');

const sendDonationData = {
  userId : 'user7',
  streamerId : 'user20',
  donationContent : 'test',
  donationAmount : '10000'
}

function sendDonation() {
  socket.emit('send_donation', {data : sendDonationData});
}

sendDonation();



