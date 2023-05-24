const mysql = require('mysql');

class MySQLConnection {
  constructor() {
    this.config = {
      host: '175.45.194.89',
      port : '3306',
      user: 'LDW',
      password: 'LDW',
      database: 'sstv'
    },

    this.connection = null;
  }

  connect() {
    this.connection = mysql.createConnection(this.config);
    
    this.connection.connect((error) => {
      if(error) {
        console.log('[MySQLConnection connect] error = ', error);
      }
    });
  }

  disconnect() {
    if(this.connection) {
      this.connection.end();
      console.log('[MySQLConnection disconnect] Close Connection');
    }
  }

  query(sql, params, callback) {
    try {
      if(!this.connection) {
        console.log('[MySQLConnection query] No Connection');
        return;
      }
  
      this.connection.query(sql, params, (error, result) => {
        if(error) {
          console.log('[MySQLConnection query] error = ', error);
          callback(error, null);
        } else {
          callback(null, result);
        }
      });
    } catch (error) {
      console.log('[MySQLConnetcion query] error = ', error);
    }
  }
}

module.exports = MySQLConnection;