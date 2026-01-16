async function sellerValidator(req, res, next)  {
    const errors = [];

    const user = req.user;

    if(!user.profile) {
        errors.push('Need a profile to be able to sell')
    }

    if(!user.location) {
        errors.push('Need a location on profile to be able to sell');
    }

    if(errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
}



module.exports = {
    canSell: sellerValidator,
}