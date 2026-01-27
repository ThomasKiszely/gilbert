const conditionRepo = require('../data/conditionRepo');


async function createCondition(conditionData) {
    return await conditionRepo.createCondition(conditionData);
}

async function readAllConditions() {
    return await conditionRepo.readAllConditions();
}

module.exports = {
    createCondition,
    readAllConditions,
}