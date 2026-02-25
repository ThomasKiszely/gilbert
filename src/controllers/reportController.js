const reportService = require('../services/reportService');
const {reportReasons} = require("../utils/reportReasons");

async function createReport(req, res, next) {
    try{
        const reportDetails = req.body;
        const reporterId = req.user.id;

        const report = await reportService.fileNewReport(reporterId, reportDetails);
        return res.status(201).json({ success: true, message: 'The report will be handled by admin.', reportId: report._id });
    } catch (error) {
        next(error);
    }
}

async function updateReport(req, res, next) {
    try{
        const reportId = req.params.id;
        const reportDetails = req.body;

        const updated = await reportService.updateReport(reportId, reportDetails);
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        next(error);
    }
}

async function getReportReasons(req, res, next) {
    try{
        return res.status(200).json({ success: true, data: reportReasons });
    } catch (error) {
        next(error);
    }
}

async function getPendingReports(req, res, next) {
    try{
        const pendingReports = await reportService.getPendingReports();
        return res.status(200).json({ success: true, data: pendingReports });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createReport,
    updateReport,
    getReportReasons,
    getPendingReports,
}