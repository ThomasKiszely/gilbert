const colorRepo = require('../data/colorRepo');

async function createColor(colorData) {
    return await colorRepo.createColor(colorData);
}

async function readAllColors() {
    return await colorRepo.readAllColors();
}

module.exports = {
    createColor,
    readAllColors,
}