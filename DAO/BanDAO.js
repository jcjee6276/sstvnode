const connection = new(require('../model/MySQLConnection'))();
const moment = require('moment');

class BanDAO {
  async addStreamingRollBan(ban) {
    try {
      connection.connect();

      const sql = 'INSERT INTO STREAMING_ROLE_BAN SET ?'
      const param = {
        USER_ID : ban.userId,
        BAN_START_DATE : moment().format('YYYY-MM-DD/HH:mm'),
        BAN_END_DATE : moment().add(ban.banPeriod, 'days').format('YYYY-MM-DD/HH:mm'),
        BAN_TYPE : ban.banType,
        BAN_CONTENT : ban.banContent
      }

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            resolve('fail');
          }else {
            resolve('success');
          }
        });
      });
      
      return result;
    } catch (error) {
      console.log('[BanDAO addBan] error = ', error);
    }
  }

  async getStreamingRollBanList() {
    try {
      connection.connect();
      
      const sql = 'SELECT * FROM STREAMING_ROLE_BAN'
      const param = [];

      const result = await new Promise((resolve, rejcet) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            resolve('fail');
          }else {
            resolve(results);
          }
        });
      });

      let response = [];
      if(result.length > 0) {
        for(const data of result) {
          response.push({...data});
        }
      }
      
      return response;
    } catch (error) {
      console.log('[BanDAO getBanList] error = ', error);
    }
  }

  async getStreamingRollBan(streamingRollBanNo) {
    try {
      connection.connect();

      const sql = 'SELECT * FROM STREAMING_ROLE_BAN WHERE STREAMING_ROLE_BAN_NO = ?';
      const param = [streamingRollBanNo];

      const result = await new Promise((resolve, rejcet) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            resolve('fail');
          }else {
            resolve(results);
          }
        });
      });

      let response;
      console.log('[BanDAO getStreamingRoleBan] result = ', result);
      if(result.length > 0) {
        response = {...result[0]};
      }
      
      return response;
    } catch (error) {
      console.log('[BanDAO getStreamingRollBan] error = ',error);
    }
  }

  async addStreamingBan(streaming) {
    try {
      connection.connect();

      let currentTime = moment().format('YYYY-MM-DD/HH:mm');

      const sql = 'UPDATE STREAMING SET BAN_TYPE = ?, BAN_CONTENT = ?, BAN_DATE = ? ' + 
      ', STREAMING_TITLE = ?, STREAMING_CATEGORY = ?, STREAMING_START_TIME = ?, STREAMING_END_TIME = ? ' + 
       ', TOTAL_STREAMING_VIEWER = ? WHERE STREAMING_NO = ?';
      const param = [
        streaming.banType, 
        streaming.banContent, 
        currentTime, 
        streaming.streamingTitle,
        streaming.streamingCategory,
        streaming.streamingStartTime,
        currentTime,
        streaming.totalStreamingViewer,
        streaming.streamingPk
      ];

      const result = await new Promise((resolve, rejcet) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[BanDAO addStreamingBan] error = ', error);
            resolve('fail');
          } else {
            resolve('success');
          }
        });
      });

      console.log('[BanDAO addStreamingBan] result = ', result);
      return result;
    } catch (error) {
      console.log('[BanDAO addStreamingBan] error = ', error);
    }
  }

  async getStreamingBanList(userId) {
    try {
      connection.connect();

      const sql = 'SELECT * FROM STREAMING WHERE USER_ID = ? AND BAN_TYPE IS NOT NULL';
      const param = [userId];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[BanDAO getStreamingBanList] error = ', error);
            resolve('fail');
          }else {
            resolve(results);
          }
        });  
      });

      const response = {...result};
      return response;
    } catch (error) {
      console.log('[BanDAO getStreamingBanList] error = ', error);
    } 
  }
}
module.exports = BanDAO;