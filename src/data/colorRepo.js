const Color = require('../models/color');

async function createColor(colorData) {
    const color = new Color(colorData);
    return await color.save();
}

async function readAllColors() {
    return await Color.find({});
}

module.exports = {
    createColor,
    readAllColors,
}