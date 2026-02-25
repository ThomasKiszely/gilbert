const Report = require("../models/Report");
const { reportStatusses } = require('../utils/reportStatusses');

async function createReport(reportData) {
    return await Report.create(reportData);
}

async function updateReport(id, reportData) {
    return await Report.findByIdAndUpdate(id, reportData, { new: true, runValidators: true });
}

async function getReportById(id) {
    return await Report.findById(id)
        .populate('reporter', 'username')
        .populate('reportedUser', 'username');
}

async function getPendingReports() {
    return await Report.find({ status: reportStatusses.pending })
        .populate('reporter', 'username')
        .populate('reportedUser', 'username');
}

module.exports = {
    createReport,
    updateReport,
    getReportById,
    getPendingReports,
}