const conditionRepo = require('../data/conditionRepo');


async function createCondition(conditionData) {
    return await conditionRepo.createCondition(conditionData);
}

module.exports = {
    createCondition,
}