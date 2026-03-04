const genderRepo = require('../data/genderRepo');

async function createGender(genderData) {
    return await genderRepo.createGender(genderData);
}

async function readAllGenders() {
    return await genderRepo.readAllGenders();
}

async function findByName(name) {
    return await genderRepo.findByName(name);
}

module.exports = {
    createGender,
    readAllGenders,
    findByName,
};

