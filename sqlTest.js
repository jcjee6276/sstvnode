const userDAO = new (require('./DAO/UserDAO'))();
const streamingService = new(require('./service/StreamingService'))();
const moment = require('moment');

const now = moment().format('YYYY-MM-DD/HH:mm');
const after = moment().add('7', 'days').format('YYYY-MM-DD/HH:mm');

console.log('after = ', after);


