const tagRepo = require('../data/tagRepo');


async function createTag(tagData) {
    return await tagRepo.createTag(tagData);
}

async function readAllTags() {
    return await tagRepo.readAllTags();
}
module.exports = {
    createTag,
    readAllTags,
}