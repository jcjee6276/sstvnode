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
}

module.exports = DonationDAO;