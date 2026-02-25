const reportRepo = require('../data/reportRepo');
const userRepo = require('../data/userRepo');
const notificationService = require('../services/notificationService');
const notificationTypes = require('../utils/notificationTypes');
const { sanitizeString, sanitizeChatMessage } = require('../utils/sanitize');

async function fileNewReport(reporterId, reportDetails){
    const reason = sanitizeString(reportDetails.reason || "");
    const details = sanitizeChatMessage(reportDetails.details || "");
    const reportedUserId = reportDetails.reportedUserId;
    if (!reason || !reportedUserId) {
        throw new Error("Missing fields in report");
    }
    const report = await reportRepo.createReport({
        reporter: reporterId,
        reportedUser: reportedUserId,
        reason,
        details,
    });
    const admins = await userRepo.findAdmins();

    const notificationPromises = admins.map(admin => {
        return notificationService.notifyUser(admin._id, {
            type: notificationTypes.report,
            message: `A user has been reported for: ${reason}`,
            reportId: report._id
        });
    });
    await Promise.all(notificationPromises);

    return report;
}
async function updateReport(reportId, reportDetails) {
    return await reportRepo.updateReport(reportId, reportDetails);
}

async function getPendingReports(){
    return await reportRepo.getPendingReports();
}

module.exports = {
    fileNewReport,
    updateReport,
    getPendingReports,
}