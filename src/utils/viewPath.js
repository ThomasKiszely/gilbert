const path = require("path");

function view(file) {
    return path.join(process.cwd(), "views", file);
}

module.exports = {
    view
};
