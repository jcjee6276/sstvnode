const connection = new (require('../model/MySQLConnection'))();
const moment = require('moment');

class ReportDAO {
  
  async addReport(report) {
    try {
      connection.connect();

      const sql = 'INSERT INTO REPORT SET ?'
      const param = {
        STREAMING_NO : report.streamingNo,
        USER_ID : report.userId,
        STREAMING_USER_ID : report.streamingUserId,
        REPORT_TYPE : report.reportType,
        REPORT_CONTENT : report.reportContent,
        REPORT_DATE : moment().format('YYYY-MM-DD/HH:mm')
      }

      let response = 'success';
      connection.query(sql, param, (error, result) => {
        if(error) {
          console.log('[ReportDAO addReport] error = ', error);
          response = 'fail';
        }
      });

      return response;
    } catch (error) {
      console.log('[ReportDAO addReport] error = ', error);
    } finally {
      connection.disconnect();
    }
  }

  async getReport(reportNo) {
    try {
      connection.connect();

      const sql = 'SELECT * FROM REPORT WHERE REPORT_NO = ?';
      const param = [reportNo];

      
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[ReportDAO getReport] error = ',error);
            resolve('fail');
          } 

          if(results.length > 0) {
            resolve({...results[0]});
          }else {
            resolve('fail');
          }
        });
      });

      return result;
    } catch (error) {
      console.log('[ReportDAO getReport] error = ', error);
    }
  }

  async getReportList() {
    try {
      connection.connect();

      const sql =  'SELECT * FROM REPORT';
      const param = [];

      
      const result = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            console.log('[ReportDAO getReportList] error = ',error);
            resolve('fail');
          }

          if(results.length > 0) {
            resolve(results);
          }else {
            resolve('fail');
          }
        });
      })
      

      let response = [];

      response.push({...result});

      console.log('[ReportDAO getReportList] response = ', response);
      return response;
    } catch (error) {
      console.log('[ReportDAT getReportList] error = ', error);
    }
  }
  
  async removeReport(reportNo) {
    try {
      connection.connect();

      const sql = 'DELETE FROM REPORT WHERE REPORT_NO = ?';
      const param = [reportNo];

      const response = await new Promise((resolve, reject) => {
        connection.query(sql, param, (error, results) => {
          if(error) {
            resolve('fail');
          }else {
            resolve('success');
          }
        }); 
      }); 
      
      return response;
    } catch (error) {
      console.log('[ReportDAO removeReport] error = ', error);
    }
  }
}

module.exports = ReportDAO;