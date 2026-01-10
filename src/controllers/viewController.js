const { resolveView, get404View } = require('../services/viewService');

async function renderView(req, res) {
    const viewName = req.params.view || "index";

    const filePath = await resolveView(viewName);

    if(!filePath) {
        return res.status(404).sendFile(get404View());
    }
    return res.sendFile(filePath);
}

module.exports = {
    renderView,
}

//bruges sådan her: window.location.href = "/login";