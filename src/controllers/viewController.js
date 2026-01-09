const path = require("path");
const fs = require("fs");

function renderView(req, res) {
    const viewName = req.params.view || "index";
    const filePath = path.join(process.cwd(), "views", `${viewName}.html`);

    if (!fs.existsSync(filePath)) {
        return res
            .status(404)
            .sendFile(path.join(process.cwd(), "views", "404.html"));
    }

    res.sendFile(filePath);
}

module.exports = {
    renderView
};
