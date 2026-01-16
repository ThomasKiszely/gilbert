const Color = require('../models/color');

async function createColor(colorData) {
    const color = new Color(colorData);
    return await color.save();
}

module.exports = {
    createColor,
}