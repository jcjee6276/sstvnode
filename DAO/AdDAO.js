const connection = new (require('../model/MySQLConnection'))();
const date = new Date();

class AdDAO {
  
  async addAdReq(userId, adName, paymentCoin) {
    try {
      connection.connect();

      const sql = 'INSERT INTO AD_REQ SET ?';
      const param = {
        USER_ID : userId,
        AD_NAME : adName,
        AD_REQ_DATE : date,
        PROCESS_CODE : 0,
        PAYMENT_COIN : paymentCoin,
        DENY_CODE : 0,
        AD_PLAYS_COUNT : 0,
        AD_TOTAL_VIEWERS : 0,
        AD_STREAMING_PLAYS_COUNT : 0
      };
  
      await connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[AdDAO addAdReq] error = ', error);
        }
      });
    } catch (error) {
      console.log('[AdDAO addAdReq] error = ', error);  
    } finally {
      connection.disconnect();
    }
  }

  /* 
  0 : 광고신청완료
  1 : 광고등록완료
  2 : 광고거절완료
  */
  async updateProcessCode(adReqNo, processCode, denyCode) {
    try {
      connection.connect();

      let sql;
      let param;
      if(denyCode) {
        sql = 'UPDATE AD_REQ SET PROCESS_CODE = ?, DENY_CODE = ? WHERE AD_REQ_NO = ?';
        param = [processCode, denyCode, adReqNo];
  
      } else {
        sql = 'UPDATE AD_REQ SET PROCESS_CODE = ? WHERE AD_REQ_NO = ?';
        param = [processCode, adReqNo];
      }
      
      
      const result = new Promise((resolve, rejcet) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            rejcet('fail');
          }
          resolve('success');
        });
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        console.log('[AdDAO updateProcessCode] error = ', error);
      });
            

      return result;
    } catch (error) {
      console.log('[AdDAO setCurtainId] error = ', error);  
      return 'fail';
    } finally {
      connection.disconnect();
    }
  }

  
  async getAdName(adReqNo) {
    try {
      connection.connect();

      const sql = 'SELECT AD_NAME FROM AD_REQ WHERE AD_REQ_NO = ?';
      const param = [adReqNo];

      let response;
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            console.log('[AdDAO getAdName] error = ', error);
            reject(error);
          }else {
            resolve(result);
          }
        });
      });

      if(result.length > 0) {
        response = result[0].AD_NAME;
      }

      return response;
    } catch (error) {
      console.log('[AdDAO setCurtainId] error = ', error);  
    } finally {
      connection.disconnect();
    }
  }

  async setCurtainId(adReqNo, curtainId) {
    try {
      connection.connect();

      const sql = 'UPDATE AD_REQ SET CURTAIN_ID = ? WHERE AD_REQ_NO = ?';
      const param = [curtainId, adReqNo];
  
      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[AdDAO setCurtainId] error = ', error);
          return;
        }
      });
    } catch (error) {
      console.log('[AdDAO setCurtainId] error = ', error);
    } finally {
      connection.disconnect();
    }

  }

  //회원들이 신청한 광고 신청목록 가져오기
  async getAdReqList() {
    try {
      connection.connect();

      const sql = 'SELECT * FROM AD_REQ'
      const param = [];
      let response = [];

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[AdDAO getAdReqList] error = ', error);
            reject(error);
          } else {
            resolve(results);
          }
        });
      });

      if(results.length > 0) {
        for(const result of results) {
          response.push({...result});
        }
      }
  
      return response;
    } catch (error) {
      console.log('[AdDAO getAdReqList] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  //실제 재생시킬 광고목록 가져오기
  async getAdList() {
    try {
      connection.connect();

      const sql = 'SELECT * FROM AD_REQ WHERE PROCESS_CODE = 1 AND AD_PLAYS_COUNT < 10 ORDER BY AD_REQ_DATE DESC'
      const param = [];
      const response = [];

      const results = await new Promise((resolve, reject) => {
        connection.query(sql, param,(error ,results) => {
          if(error) {
            console.log('[AdDAO getAdList] error = ', error);
            reject(error);
          } else {
            resolve(results);
          }
        });
      });

      if(results.length > 0) {
        for(const result of results) {
          response.push(({...result}));
        }
      }

      return response;
    } catch (error) {
      console.log('[AdDAO getAdList] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async updateAdPlaysCount(adReqNo, adPlaysCount) {
    try {
      connection.connect();

      const sql = 'UPDATE AD_REQ SET AD_PLAYS_COUNT = ? WHERE AD_REQ_NO = ?';
      const param = [adPlaysCount, adReqNo];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            console.log('[AdDAO updateAdPlaysCount] error = ', error);
            reject(error);

          } else {
            
            resolve(result);
          }
        });
      });
      
      return result;
    } catch (error) {
      console.log('[AdDAO updateAdPlaysCount] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async updateAdStreamingPlaysCount(adReqNo, adStreamingPlaysCount) {
    try {
      connection.connect();

      const sql = 'UPDATE AD_REQ SET AD_STREAMING_PLAYS_COUNT = ? WHERE AD_REQ_NO = ?';
      const param = [adStreamingPlaysCount, adReqNo];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            console.log('[AdDAO updateAdStreamingPlaysCount] error = ', error);
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      console.log('[AdDAO updateAdStreamingPlaysCount] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async updateAdTotalViewer(adReqNo, adTotalViewer) {
    try {
      connection.connect();

      const sql = 'UPDATE AD_REQ SET AD_TOTAL_VIEWERS = ? WHERE AD_REQ_NO = ?';
      const param = [adTotalViewer, adReqNo];

      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            console.log('[AdDAO updateAdTotalViewer] error = ', error);
            reject(error);
          } else {
            
            resolve(result);
          }
        });
      });

      return result;
    } catch (error) {
      console.log('[AdDAO updateAdTotalViewer] error = ', error);
    } finally {
      connection.disconnect();
    }
  }
}

module.exports = AdDAO;