const connection = new (require('../model/MySQLConnection'))();

class UserDAO {
  async updateUserCoin(coin, userId) {
    try {
      console.log('[UserDAO updateUserCoin] coin = ', coin);
      console.log('[UserDAO updateUserCoin] userId = ', userId);
      connection.connect();
  
      const sql = 'UPDATE USER SET COIN = ? WHERE USER_ID = ?';
      const param = [coin, userId];

      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[UserDAO updateCoin] error = ', error);
        }
      });
    } catch (error) {
      console.log('[UserDAO updateUserCoin] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  //1 : 광고신청 2: 광고신청 거절
  async addUserCoinHistory(userId, price, prodName) {
    connection.connect();

    const sql = 'INSERT INTO COIN_HISTORY (USER_ID, PRICE, PROD_NAME) VALUES(?, ?, ?) ';
    const param = [userId, price, prodName];

    connection.query(sql, param, (error, result) => {
      if(error) {
        console.log('[UserDAO decreaseCoin] error = ', error);
        return "fail";
      }

      connection.disconnect();
      return "success";
    });
  }

  getUserCoin(userId) {
    return new Promise((resolve, rejcet) => {
      connection.connect();

      const sql = 'SELECT COIN FROM USER WHERE USER_ID = ?'
      const param = [userId];

      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[UserDAO getUserCoin] error = ', error);
          connection.disconnect(); 
          return;
        }

        let coin;
        if(result.length > 0) {
          coin = result[0].COIN;
        }
        
        console.log('[UserDAO getUserCoin] coin = ', coin);
        resolve(coin);
      });
    });
  }

  async getUserTicket(userId) {
    try {
      connection.connect();

      const sql = 'SELECT * FROM TICKET WHERE USER_ID = ?';
      const param = [userId];
      const response = [];
      
      const result = await new Promise((resolve, rejcet) => {
        connection.query(sql, param, (error, result) => {
          if(error) {
            rejcet(error);
          }else {
            resolve(result);
          }
        });
      });

      if(result.length > 0) {
        for(const data of result) {
          response.push({...data});
        }
      }
      return response;
    } catch (error) {
      console.log('[UserDAO getUserTicket] error = ', error);
    } finally {
      connection.disconnect();
    }
  } 

  async updateStRoll(userId, stRoll) {
    try {
      connection.connect();
      
      const sql = 'UPDATE USER SET ST_ROLL = ? WHERE USER_ID = ?';
      const param = [stRoll , userId];

      const result = await new Promise((resolve, rejcet) => {
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
      console.log('[UserDAO updateStRoll] error = ', error);
    }
  }

  async getAdminUserList(searchCondition, searchKeyword) {
    try {
      connection.connect();

      let sql = 'SELECT u.USER_ID, u.PROFILE_PHOTO, u.USER_NICKNAME'
                + ', u.USER_NAME, u.DATE_BIRTH, u.EMAIL, u.PHONE, DATE_FORMAT(u.SIGN_DATE, "%Y-%m-%d / %H:%i") AS SIGN_DATE'
                + ', u.ROLL, u.COIN, u.ACCUMULATED_VIEWERS, u.TOTAL_STREAMING_ACCUMULATED_TIME, u.ST_ROLL'
                + ', (SELECT COUNT(*) FROM FAN WHERE USER_ID = u.USER_ID) AS FOLLOWER'
                + ' FROM USER u';
      const param = [];

      if(searchCondition == '0') {
        sql = sql + ` WHERE u.USER_NAME LIKE '%${searchKeyword}%'`;
      }

      if(searchCondition == '1'){
        sql = sql + ` WHERE u.USER_NICKNAME LIKE '%${searchKeyword}%'`;
      }
      
      sql = sql + ' ORDER BY SIGN_DATE DESC';
      const response = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error ,results) => {
          if(error) {
            resolve('fail');
          }else {
            resolve(results);
          }
        });
      });

      let result = [];
      if(response && response.length > 0) {
        for(const data of response) {
          result.push({...data});
        }
      }
      
      return result;
    } catch (error) {
      console.log('[UserDAO getAdminUserList] error = ', error);
      return 'fail';
    }
  }
  
}

module.exports = UserDAO;