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

  
}

module.exports = UserDAO;