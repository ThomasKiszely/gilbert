const Tag = require('../models/Tag');


async function createTag(tagData) {
    const tag = new Tag(tagData);
    return await tag.save();
}

module.exports = {
    createTag,
}