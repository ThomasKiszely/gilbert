const fs = require("fs/promises");
const path = require("path");
const safePath = require("../utils/safePath");
const { view } = require("../utils/viewPath");

async function resolveView(viewName) {
    const baseDir = view(""); // /projekt/views/
    const filePath = safePath(baseDir, `${viewName}.html`);

    if (!filePath) {
        return null; // path traversal eller ugyldigt navn
    }

    try {
        await fs.access(filePath);
        return filePath;
    } catch {
        return null; // fil findes ikke
    }
}

function get404View() {
    return view("404.html");
}

module.exports = {
    resolveView,
    get404View
};
