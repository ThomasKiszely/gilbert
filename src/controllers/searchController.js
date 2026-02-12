const {searchAll} = require("../services/searchService");

async function search(req, res, next) {
    try {
        const q = req.query.q;
        const userId = req.user?._id;

        const results = await searchAll(q, userId);

        res.json(results);
    } catch (err) {
        next(err);
    }
}
module.exports = {
    search
}