const tagRepo = require('../data/tagRepo');


async function createTag(tagData) {
    return await tagRepo.createTag(tagData);
}

module.exports = {
    createTag,
}