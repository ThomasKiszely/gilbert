const mongoose = require('mongoose');


function validateFavorite(req, res, next) {
    const {productId} = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({success: false, error: "Invalid product id format"});
    }

    next();
}

module.exports = {
    validateFavorite,
}