const path = require('path');

function notFound(req, res, next) {
    res.status(404).sendFile(path.join(process.cwd(), 'views', '404.html'));
}

module.exports = { notFound };