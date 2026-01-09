const { view } = require("../utils/viewPath");

function showIndex(req, res) {
    res.sendFile(view("index.html"));
}

module.exports = { showIndex };
