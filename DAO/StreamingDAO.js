const connection = new (require('../model/MySQLConnection'))();

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
}

module.exports = StreamingDAO;