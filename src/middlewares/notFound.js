const path = require('path');

function notFound(req, res, next) {
    res.status(404).sendFile(path.join(__dirname, '..', '..', 'public', 'errors', '404.html'));
}

module.exports = { notFound };