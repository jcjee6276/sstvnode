const connection = new (require('../model/MySQLConnection'))();
const moment = require('moment');

class StreamingDAO {
  async addStreaming(streaming) {
    try {
      await connection.connect();

      const sql = "INSERT INTO STREAMING SET ?"
      const param = {
        USER_ID : streaming.userId,
        STREAMING_CATEGORY : streaming.streamingCategory,
        STREAMING_TITLE : streaming.streamingTitle,
        STREAMING_START_TIME : streaming.streamingStartTime
      }

      const pk = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            reject(error);
          } else {
            resolve(result.insertId);
          }
        });
      })
      .catch((error) => {
        console.log('[StreamingDAO addStreaming] error = ', error);
      });
      
      return pk;
    } catch (error) {
      console.log('[StreamingDAO insertStreaming] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async finishStreaming(streaming) {
    try {
      await connection.connect();

      const sql = 'UPDATE STREAMING SET USER_ID = ?, STREAMING_CATEGORY = ?, STREAMING_TITLE = ?, ' +
      'STREAMING_START_TIME = ?, STREAMING_END_TIME = ?, TOTAL_STREAMING_VIEWER = ? , RECORD_URL = ? WHERE STREAMING_NO = ?';

      const param = [
        streaming.userId,
        streaming.streamingCategory,
        streaming.streamingTitle,
        streaming.streamingStartTime,
        moment().format('YYYY-MM-DD/HH:mm'),
        streaming.totalStreamingViewer,
        streaming.recordUrl,
        streaming.streamingPk
      ]

      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[StreamingDAO finishStreaming] error = ', error);
        }
      });
    } catch (error) {
      console.log('[StreamingDAO finishStreaming] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async getStreaming(streamingNo) {
    try {
      connection.connect();

      const sql = 'SELECT * FROM STREAMING WHERE STREAMING_NO = ?';
      const param = [streamingNo];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[StreamingDAO getStreaming] error = ', error);
            resolve('fail');
          }else {
            resolve(results);
          }
        });  
      });

      let response;
      if(result.length > 0) {
        response = {...result[0]};
      }

      return response;
    } catch (error) {
      console.log('[StreamingDAO getStreaming] error = ', error);
      return 'fail';
    }
  }
}

module.exports = StreamingDAO;