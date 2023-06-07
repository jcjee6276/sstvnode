const connection = new (require('../model/MySQLConnection'))();


class DonationDAO {
  async addDonation(donation) {
    try {
      connection.connect();

      const sql = "INSERT INTO DONATION SET ?"
      const param = donation;

      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[DonationDAO addDonation] error = ', error);
        }
      });
    } catch (error) {
      console.log('[DonationDAO addDonation] error = ', error);
    }
  }

  async getDonationList(userId) {
    try {
      connection.connect();

      let sql;
      const parma = [userId];

      if(userId) {
        sql = 'SELECT * FROM DONATION WHERE USER_ID = ?';
      }else {
        sql = 'SELECT * FROM DONATION';
      }

      let donationList = [];
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, parma, (error, results) => {
          if(error) {
            console.log('[DonationDAO getDonationList] error = ' ,error );
          }else {
            resolve(results);
          }
        });
      });

      if(result.length > 0) {
        for(const data of result) {
          donationList.push({...data});
        }
      }
      

      return donationList;
    } catch (error) {
      console.log('[DonationDAO getDonationList] error = ' ,error );
    }
  } 
}

module.exports = DonationDAO;