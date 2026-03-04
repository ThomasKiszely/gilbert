const genderService = require('../services/genderService');

async function createGender(req, res, next) {
    try {
        const gender = await genderService.createGender(req.body);
        if (!gender) {
            const error = new Error('Gender not created');
            error.status = 400;
            return next(error);
        }
        res.status(201).json(gender);
    } catch (error) {
        next(error);
    }
}

async function readAllGenders(req, res, next) {
    try {
        const genders = await genderService.readAllGenders();
        if (!genders) {
            const error = new Error('Could not read genders');
            error.status = 400;
            return next(error);
        }
        res.status(200).json(genders);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createGender,
    readAllGenders,
};

