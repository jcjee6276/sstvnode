const reportDAO = new(require('../DAO/ReportDAO'))();

class ReportService{

  async addReport(report) {
    const result = await reportDAO.addReport(report);
    return result;
  }

  async getReport(reportNo) {
    const report = await reportDAO.getReport(reportNo);
    return report
  }

  async getReportList() {
    const reportList = await reportDAO.getReportList();
    return reportList;
  }

  async removeReport(reportNo) {
    const result = await reportDAO.removeReport();
    return result;
  }
}

module.exports = ReportService;