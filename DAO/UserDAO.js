const connection = new (require('../model/MySQLConnection'))();

class UserDAO {
  async updateUserCoin(coin, userId) {
    return new Promise((resolve, reject) => {
      connection.connect();

      const sql = 'UPDATE USER SET COIN = ? WHERE USER_ID = ?';
      const param = [coin, userId];

      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[UserDAO updateCoin] error = ', error);
          connection.disconnect();
          reject("fail");
        }

      
        // connection.disconnect();
        resolve('success');
      });
    });
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

  async getUserCoin(userId) {
    return new Promise(async (resolve, rejcet) => {
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
        
        // connection.disconnect(); 
        resolve(coin);
      });
    });
  }
}

module.exports = UserDAO;