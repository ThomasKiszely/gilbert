const colorRepo = require('../data/colorRepo');

async function createColor(colorData) {
    return await colorRepo.createColor(colorData);
}

module.exports = {
    createColor,
}