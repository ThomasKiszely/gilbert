/*const { resolveView, get404View } = require('../services/viewService');
const { PUBLIC_VIEWS } = require('../utils/public_views');
const { ADMIN_VIEWS } = require('../utils/admin_views');

async function renderView(req, res) {
    const viewName = req.params.view || "index";

    // PUBLIC
    if (PUBLIC_VIEWS.includes(viewName)) {
        return sendView(res, viewName);
    }

    // PROTECTED
    if (!req.user) {
        return res.redirect("/login");
    }

    // ADMIN
    if (ADMIN_VIEWS.includes(viewName)) {
        if (req.user.role !== "admin") {
            return res.redirect("/");
        }
    }

    return sendView(res, viewName);
}


async function sendView(res, viewName) {
    const filePath = await resolveView(viewName);

    if (!filePath) {
        return res.status(404).sendFile(get404View());
    }

    return res.sendFile(filePath);
}

module.exports = {
    renderView,
};
*/