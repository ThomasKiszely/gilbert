const Tag = require('../models/Tag');


async function createTag(tagData) {
    const tag = new Tag(tagData);
    return await tag.save();
}

async function readAllTags() {
    return await Tag.find({});
}

module.exports = {
    createTag,
    readAllTags,
}