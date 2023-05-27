const express = require('express');
const router = express.Router();
const reportService = new(require('../service/ReportService'))();
const moment = require('moment');
const Data = require('../model/Data');

router.post('/addReport', async (req, res) => {
  const report = req.body;
  const result = await reportService.addReport(report);

  let response;
  console.log(result);
  if(result == 'success') {
    response = new Data('success','');
  }

  if(result == 'fail') {
    response = new Data('fail','');
  }
   
  res.json(response);
});

router.get('/getReport', async (req, res) => {
  const reportNo = req.query.reportNo;

  const report = await reportService.getReport(reportNo);
  
  let response;
  if(report == 'fail') {
    response = new Data('fail','');
  }else {
    response = new Data('success',response);
  }

  res.json(response);
});

router.get('/getReportList', async (req, res) => {
  const result = await reportService.getReportList();
  
  let response;
  if(result == 'fail') {
    response = new Data('fail','');
  }else {
    response = new Data('success',result);
  }

  res.json(response);
});

router.get('/removeReport', async (req, res) => {
  const reportNo = req.query.reportNo
  const result = await reportService.removeReport(reportNo);

  console.log('[router result]', result);
  
  let response;
  if(result == 'fail') {
    response = new Data('fail','');
  }else {
    response = new Data('success','');
  }
  
  res.json(response);
});

module.exports = router;