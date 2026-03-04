const Gender = require('../models/Gender');

async function createGender(genderData) {
    const gender = new Gender(genderData);
    return await gender.save();
}

async function readAllGenders() {
    return await Gender.find({});
}

async function findByName(name) {
    return await Gender.findOne({ name });
}

module.exports = {
    createGender,
    readAllGenders,
    findByName,
};

