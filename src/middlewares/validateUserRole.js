const { userRoles } = require('../utils/userRoles');

function validateUserRole(req, res, next) {
    const { role } = req.body;

    if (!Object.values(userRoles).includes(role)) {
        return res.status(400).json({
            success: false,
            error: 'invalid role',
        });
    }
    next();
}

module.exports = {
    validateUserRole
};